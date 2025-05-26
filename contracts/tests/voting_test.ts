import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.7.1/index.ts';
import { assertEquals, assert } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

const contract_name = "voting";

// Helper to get election details from the map
const getElection = (chain: Chain, electionId: number, deployer: Account) => {
    return chain.callReadOnlyFn(contract_name, "get-election-details", [types.uint(electionId)], deployer.address);
};

// Helper to get election results
const getResults = (chain: Chain, electionId: number, deployer: Account) => {
    return chain.callReadOnlyFn(contract_name, "get-election-results", [types.uint(electionId)], deployer.address);
};

// Helper to check if voted
const hasVoted = (chain: Chain, electionId: number, voter: Account) => {
    return chain.callReadOnlyFn(contract_name, "has-voted", [types.uint(electionId), types.principal(voter.address)], voter.address);
};

Clarinet.test({
    name: "Ensure election can be created successfully",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet1 = accounts.get("wallet_1")!;
        const question = "Test Question?";
        const options = ["Option A", "Option B"];
        const startBlock = 10;
        const endBlock = 110;

        // Mine a block to move past block 0 if needed
        chain.mineEmptyBlock(5);

        let block = chain.mineBlock([
            Tx.contractCall(contract_name, "create-election", [
                types.utf8(question),
                types.uint(startBlock),
                types.uint(endBlock),
                types.list(options.map(opt => types.utf8(opt)))
            ], wallet1.address)
        ]);

        // Check receipt for success (ok u1 for the first election)
        block.receipts[0].result.expectOk().expectUint(1);

        // Verify election details
        const electionDetails = getElection(chain, 1, deployer).result;
        assert(electionDetails.expectSome().expectTuple()); // Check it's a Some(tuple)
        const details = electionDetails.expectSome().expectTuple();
        assertEquals(details["id"], types.uint(1));
        assertEquals(details["question"], types.utf8(question));
        assertEquals(details["creator"], types.principal(wallet1.address));
        assertEquals(details["start-block"], types.uint(startBlock));
        assertEquals(details["end-block"], types.uint(endBlock));
        assertEquals(details["options"], types.list(options.map(opt => types.utf8(opt))));
        assertEquals(details["total-votes"], types.uint(0));

        // Verify initial results are zero
        const results = getResults(chain, 1, deployer).result.expectOk().expectList();
        assertEquals(results.length, options.length);
        results.forEach(count => assertEquals(count, types.uint(0)));
    },
});

Clarinet.test({
    name: "Ensure vote can be cast successfully within election period",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet1 = accounts.get("wallet_1")!;
        const wallet2 = accounts.get("wallet_2")!;
        const question = "Vote Test?";
        const options = ["Yes", "No"];
        const startBlock = 10;
        const endBlock = 110;

        // Create election
        chain.mineBlock([
            Tx.contractCall(contract_name, "create-election", [
                types.utf8(question),
                types.uint(startBlock),
                types.uint(endBlock),
                types.list(options.map(opt => types.utf8(opt)))
            ], wallet1.address)
        ]);

        // Advance chain to the voting period
        chain.mineEmptyBlockUntil(startBlock);

        // Wallet 2 casts a vote for option 0 ("Yes")
        let block = chain.mineBlock([
            Tx.contractCall(contract_name, "cast-vote", [types.uint(1), types.uint(0)], wallet2.address)
        ]);

        // Check receipt for success (ok true)
        block.receipts[0].result.expectOk().expectBool(true);

        // Verify results
        const results = getResults(chain, 1, deployer).result.expectOk().expectList();
        assertEquals(results[0], types.uint(1)); // Option 0 should have 1 vote
        assertEquals(results[1], types.uint(0)); // Option 1 should have 0 votes

        // Verify total votes in election details
        const electionDetails = getElection(chain, 1, deployer).result.expectSome().expectTuple();
        assertEquals(electionDetails["total-votes"], types.uint(1));

        // Verify wallet 2 has voted
        hasVoted(chain, 1, wallet2).result.expectBool(true);
        // Verify wallet 1 has not voted
        hasVoted(chain, 1, wallet1).result.expectBool(false);
    },
});

Clarinet.test({
    name: "Ensure vote cannot be cast before start block",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get("wallet_1")!;
        const wallet2 = accounts.get("wallet_2")!;
        const startBlock = 10;
        const endBlock = 110;

        // Create election
        chain.mineBlock([
            Tx.contractCall(contract_name, "create-election", [
                types.utf8("Early Vote Test?"),
                types.uint(startBlock),
                types.uint(endBlock),
                types.list([types.utf8("A"), types.utf8("B")])
            ], wallet1.address)
        ]);

        // Try to vote before startBlock (current block height is likely 2 or 3)
        let block = chain.mineBlock([
            Tx.contractCall(contract_name, "cast-vote", [types.uint(1), types.uint(0)], wallet2.address)
        ]);

        // Check receipt for error ERR-ELECTION-NOT-STARTED (u103)
        block.receipts[0].result.expectErr().expectUint(103);
    },
});

Clarinet.test({
    name: "Ensure vote cannot be cast after end block",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get("wallet_1")!;
        const wallet2 = accounts.get("wallet_2")!;
        const startBlock = 5;
        const endBlock = 15;

        // Create election
        chain.mineBlock([
            Tx.contractCall(contract_name, "create-election", [
                types.utf8("Late Vote Test?"),
                types.uint(startBlock),
                types.uint(endBlock),
                types.list([types.utf8("A"), types.utf8("B")])
            ], wallet1.address)
        ]);

        // Advance chain past the end block
        chain.mineEmptyBlockUntil(endBlock + 1);

        // Try to vote after endBlock
        let block = chain.mineBlock([
            Tx.contractCall(contract_name, "cast-vote", [types.uint(1), types.uint(0)], wallet2.address)
        ]);

        // Check receipt for error ERR-ELECTION-ENDED (u104)
        block.receipts[0].result.expectErr().expectUint(104);
    },
});

Clarinet.test({
    name: "Ensure voter cannot vote twice",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get("wallet_1")!;
        const wallet2 = accounts.get("wallet_2")!;
        const startBlock = 10;
        const endBlock = 110;

        // Create election
        chain.mineBlock([
            Tx.contractCall(contract_name, "create-election", [
                types.utf8("Double Vote Test?"),
                types.uint(startBlock),
                types.uint(endBlock),
                types.list([types.utf8("A"), types.utf8("B")])
            ], wallet1.address)
        ]);

        // Advance chain to the voting period
        chain.mineEmptyBlockUntil(startBlock);

        // Wallet 2 votes first time
        chain.mineBlock([
            Tx.contractCall(contract_name, "cast-vote", [types.uint(1), types.uint(0)], wallet2.address)
        ]);

        // Wallet 2 tries to vote second time
        let block = chain.mineBlock([
            Tx.contractCall(contract_name, "cast-vote", [types.uint(1), types.uint(1)], wallet2.address)
        ]);

        // Check receipt for error ERR-ALREADY-VOTED (u105)
        block.receipts[0].result.expectErr().expectUint(105);
    },
});

Clarinet.test({
    name: "Ensure vote fails for invalid option index",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get("wallet_1")!;
        const wallet2 = accounts.get("wallet_2")!;
        const startBlock = 10;
        const endBlock = 110;

        // Create election with 2 options (indices 0, 1)
        chain.mineBlock([
            Tx.contractCall(contract_name, "create-election", [
                types.utf8("Invalid Option Test?"),
                types.uint(startBlock),
                types.uint(endBlock),
                types.list([types.utf8("A"), types.utf8("B")])
            ], wallet1.address)
        ]);

        // Advance chain to the voting period
        chain.mineEmptyBlockUntil(startBlock);

        // Wallet 2 tries to vote for option index 2 (invalid)
        let block = chain.mineBlock([
            Tx.contractCall(contract_name, "cast-vote", [types.uint(1), types.uint(2)], wallet2.address)
        ]);

        // Check receipt for error ERR-INVALID-OPTION (u106)
        block.receipts[0].result.expectErr().expectUint(106);
    },
});

Clarinet.test({
    name: "Ensure election creation fails with invalid times",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get("wallet_1")!;

        // Case 1: Start block in the past
        let block = chain.mineBlock([
            Tx.contractCall(contract_name, "create-election", [
                types.utf8("Past Start Test?"),
                types.uint(0), // Start block 0, current height > 0
                types.uint(10),
                types.list([types.utf8("A")])
            ], wallet1.address)
        ]);
        block.receipts[0].result.expectErr().expectUint(107); // ERR-INVALID-TIMES

        // Case 2: End block not after start block
        block = chain.mineBlock([
            Tx.contractCall(contract_name, "create-election", [
                types.utf8("End Before Start Test?"),
                types.uint(20),
                types.uint(15), // End block 15 before start block 20
                types.list([types.utf8("A")])
            ], wallet1.address)
        ]);
        block.receipts[0].result.expectErr().expectUint(107); // ERR-INVALID-TIMES
    },
});

