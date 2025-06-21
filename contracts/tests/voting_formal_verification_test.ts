import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.7.1/index.ts';
import { assertEquals, assert } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

const contract_name = "voting";

// Formal verification and property-based tests for the enhanced voting contract

Clarinet.test({
    name: "Property: Election ID counter always increases monotonically",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get("wallet_1")!;
        const deployer = accounts.get("deployer")!;
        
        // Get initial election count
        const initialCount = chain.callReadOnlyFn(contract_name, "get-election-count", [], deployer.address);
        const initialValue = initialCount.result.expectOk().expectUint();
        
        // Create multiple elections
        for (let i = 0; i < 5; i++) {
            chain.mineBlock([
                Tx.contractCall(contract_name, "create-election", [
                    types.utf8(`Election ${i}?`),
                    types.uint(10 + i),
                    types.uint(110 + i),
                    types.list([types.utf8("Yes"), types.utf8("No")])
                ], wallet1.address)
            ]);
            
            // Verify counter increased
            const currentCount = chain.callReadOnlyFn(contract_name, "get-election-count", [], deployer.address);
            const currentValue = currentCount.result.expectOk().expectUint();
            assertEquals(currentValue, initialValue + i + 1);
        }
    },
});

Clarinet.test({
    name: "Property: Vote counts are always non-negative and consistent",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get("wallet_1")!;
        const wallet2 = accounts.get("wallet_2")!;
        const deployer = accounts.get("deployer")!;
        const startBlock = 10;
        const endBlock = 110;
        
        // Create election
        chain.mineBlock([
            Tx.contractCall(contract_name, "create-election", [
                types.utf8("Consistency Test?"),
                types.uint(startBlock),
                types.uint(endBlock),
                types.list([types.utf8("A"), types.utf8("B"), types.utf8("C")])
            ], wallet1.address)
        ]);
        
        chain.mineEmptyBlockUntil(startBlock);
        
        // Cast votes and verify consistency
        const voters = [wallet1, wallet2];
        let totalExpectedVotes = 0;
        
        for (let i = 0; i < voters.length; i++) {
            const voter = voters[i];
            const optionIndex = i % 3; // Distribute votes across options
            
            chain.mineBlock([
                Tx.contractCall(contract_name, "cast-vote", [
                    types.uint(1),
                    types.uint(optionIndex)
                ], voter.address)
            ]);
            
            totalExpectedVotes++;
            
            // Verify vote counts are non-negative
            for (let j = 0; j < 3; j++) {
                const voteCount = chain.callReadOnlyFn(contract_name, "get-vote-count", [
                    types.uint(1),
                    types.uint(j)
                ], deployer.address);
                const count = voteCount.result.expectUint();
                assert(count >= 0, `Vote count should be non-negative, got ${count}`);
            }
            
            // Verify total votes match election data
            const electionDetails = chain.callReadOnlyFn(contract_name, "get-election-details", [
                types.uint(1)
            ], deployer.address);
            const details = electionDetails.result.expectSome().expectTuple();
            assertEquals(details["total-votes"], types.uint(totalExpectedVotes));
        }
    },
});

Clarinet.test({
    name: "Property: Voter can only vote once per election (idempotency)",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get("wallet_1")!;
        const wallet2 = accounts.get("wallet_2")!;
        const deployer = accounts.get("deployer")!;
        const startBlock = 10;
        const endBlock = 110;
        
        // Create election
        chain.mineBlock([
            Tx.contractCall(contract_name, "create-election", [
                types.utf8("Idempotency Test?"),
                types.uint(startBlock),
                types.uint(endBlock),
                types.list([types.utf8("Option A"), types.utf8("Option B")])
            ], wallet1.address)
        ]);
        
        chain.mineEmptyBlockUntil(startBlock);
        
        // First vote should succeed
        let block = chain.mineBlock([
            Tx.contractCall(contract_name, "cast-vote", [
                types.uint(1),
                types.uint(0)
            ], wallet2.address)
        ]);
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify voter is marked as having voted
        const hasVoted1 = chain.callReadOnlyFn(contract_name, "has-voted", [
            types.uint(1),
            types.principal(wallet2.address)
        ], deployer.address);
        hasVoted1.result.expectBool(true);
        
        // Second vote should fail
        block = chain.mineBlock([
            Tx.contractCall(contract_name, "cast-vote", [
                types.uint(1),
                types.uint(1)
            ], wallet2.address)
        ]);
        block.receipts[0].result.expectErr().expectUint(105); // ERR-ALREADY-VOTED
        
        // Vote counts should remain unchanged
        const voteCountA = chain.callReadOnlyFn(contract_name, "get-vote-count", [
            types.uint(1),
            types.uint(0)
        ], deployer.address);
        assertEquals(voteCountA.result, types.uint(1));
        
        const voteCountB = chain.callReadOnlyFn(contract_name, "get-vote-count", [
            types.uint(1),
            types.uint(1)
        ], deployer.address);
        assertEquals(voteCountB.result, types.uint(0));
    },
});

Clarinet.test({
    name: "Property: Election timing constraints are always enforced",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get("wallet_1")!;
        const wallet2 = accounts.get("wallet_2")!;
        const startBlock = 20;
        const endBlock = 120;
        
        // Create election
        chain.mineBlock([
            Tx.contractCall(contract_name, "create-election", [
                types.utf8("Timing Constraints Test?"),
                types.uint(startBlock),
                types.uint(endBlock),
                types.list([types.utf8("Yes"), types.utf8("No")])
            ], wallet1.address)
        ]);
        
        // Test voting before start block
        let block = chain.mineBlock([
            Tx.contractCall(contract_name, "cast-vote", [
                types.uint(1),
                types.uint(0)
            ], wallet2.address)
        ]);
        block.receipts[0].result.expectErr().expectUint(103); // ERR-ELECTION-NOT-STARTED
        
        // Advance to valid voting period
        chain.mineEmptyBlockUntil(startBlock);
        
        // Voting should work now
        block = chain.mineBlock([
            Tx.contractCall(contract_name, "cast-vote", [
                types.uint(1),
                types.uint(0)
            ], wallet2.address)
        ]);
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Advance past end block
        chain.mineEmptyBlockUntil(endBlock);
        
        // Voting should fail after end block
        block = chain.mineBlock([
            Tx.contractCall(contract_name, "cast-vote", [
                types.uint(1),
                types.uint(1)
            ], wallet1.address)
        ]);
        block.receipts[0].result.expectErr().expectUint(104); // ERR-ELECTION-ENDED
    },
});

Clarinet.test({
    name: "Property: Allowlist operations maintain consistency",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet1 = accounts.get("wallet_1")!;
        const wallet2 = accounts.get("wallet_2")!;
        const startBlock = 30;
        const endBlock = 130;
        
        // Create allowlist election
        chain.mineBlock([
            Tx.contractCall(contract_name, "create-election-enhanced", [
                types.utf8("Allowlist Consistency Test?"),
                types.uint(startBlock),
                types.uint(endBlock),
                types.list([types.utf8("Option A"), types.utf8("Option B")]),
                types.ascii("standard"),
                types.none(),
                types.uint(0),
                types.bool(true), // use-allowlist
                types.none(),
                types.none()
            ], wallet1.address)
        ]);
        
        // Initially, no one should be allowlisted
        const initialCheck = chain.callReadOnlyFn(contract_name, "is-allowlisted", [
            types.uint(1),
            types.principal(wallet2.address)
        ], deployer.address);
        initialCheck.result.expectBool(false);
        
        // Add to allowlist
        chain.mineBlock([
            Tx.contractCall(contract_name, "add-to-allowlist", [
                types.uint(1),
                types.principal(wallet2.address)
            ], wallet1.address)
        ]);
        
        // Should now be allowlisted
        const afterAdd = chain.callReadOnlyFn(contract_name, "is-allowlisted", [
            types.uint(1),
            types.principal(wallet2.address)
        ], deployer.address);
        afterAdd.result.expectBool(true);
        
        // Remove from allowlist
        chain.mineBlock([
            Tx.contractCall(contract_name, "remove-from-allowlist", [
                types.uint(1),
                types.principal(wallet2.address)
            ], wallet1.address)
        ]);
        
        // Should no longer be allowlisted
        const afterRemove = chain.callReadOnlyFn(contract_name, "is-allowlisted", [
            types.uint(1),
            types.principal(wallet2.address)
        ], deployer.address);
        afterRemove.result.expectBool(false);
    },
});

Clarinet.test({
    name: "Property: Weighted voting preserves vote weight accuracy",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet1 = accounts.get("wallet_1")!;
        const wallet2 = accounts.get("wallet_2")!;
        const startBlock = 10;
        const endBlock = 110;
        const tokenContract = deployer.address;
        
        // Create weighted election
        chain.mineBlock([
            Tx.contractCall(contract_name, "create-election-enhanced", [
                types.utf8("Weighted Accuracy Test?"),
                types.uint(startBlock),
                types.uint(endBlock),
                types.list([types.utf8("Option A"), types.utf8("Option B")]),
                types.ascii("weighted"),
                types.some(types.principal(tokenContract)),
                types.uint(1),
                types.bool(false),
                types.none(),
                types.none()
            ], wallet1.address)
        ]);
        
        chain.mineEmptyBlockUntil(startBlock);
        
        // Cast weighted votes
        const voters = [wallet1, wallet2];
        let expectedWeightedTotal = 0;
        
        for (const voter of voters) {
            chain.mineBlock([
                Tx.contractCall(contract_name, "cast-vote", [
                    types.uint(1),
                    types.uint(0) // All vote for Option A
                ], voter.address)
            ]);
            
            // Mock token balance is 100 for each voter
            expectedWeightedTotal += 100;
        }
        
        // Verify weighted results
        const weightedResults = chain.callReadOnlyFn(contract_name, "get-weighted-election-results", [
            types.uint(1)
        ], deployer.address);
        const results = weightedResults.result.expectOk().expectList();
        
        // Option A should have total weighted votes equal to sum of token balances
        assertEquals(results[0], types.uint(expectedWeightedTotal));
        assertEquals(results[1], types.uint(0));
        
        // Regular vote count should still be number of voters
        const regularResults = chain.callReadOnlyFn(contract_name, "get-election-results", [
            types.uint(1)
        ], deployer.address);
        const regularResultsList = regularResults.result.expectOk().expectList();
        assertEquals(regularResultsList[0], types.uint(voters.length));
        assertEquals(regularResultsList[1], types.uint(0));
    },
});
