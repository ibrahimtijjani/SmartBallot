import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Analytics: get-election-analytics returns comprehensive data for valid election",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const voter1 = accounts.get('wallet_1')!;
        const voter2 = accounts.get('wallet_2')!;

        // Create an election
        let block = chain.mineBlock([
            Tx.contractCall('voting', 'create-election', [
                types.utf8("Test Election"),
                types.list([types.utf8("Option A"), types.utf8("Option B")]),
                types.uint(10),
                types.uint(100),
                types.utf8("standard"),
                types.bool(false),
                types.none(),
                types.uint(0)
            ], deployer.address)
        ]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result.expectOk(), types.uint(1));

        // Cast some votes
        block = chain.mineBlock([
            Tx.contractCall('voting', 'cast-vote', [
                types.uint(1),
                types.uint(0)
            ], voter1.address),
            Tx.contractCall('voting', 'cast-vote', [
                types.uint(1),
                types.uint(1)
            ], voter2.address)
        ]);
        assertEquals(block.receipts.length, 2);
        assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
        assertEquals(block.receipts[1].result.expectOk(), types.bool(true));

        // Test get-election-analytics
        let analyticsCall = chain.callReadOnlyFn('voting', 'get-election-analytics', [
            types.uint(1)
        ], deployer.address);

        const analytics = analyticsCall.result.expectOk().expectTuple();
        
        // Verify election data is included
        const election = analytics['election'].expectTuple();
        assertEquals(election['id'], types.uint(1));
        assertEquals(election['question'], types.utf8("Test Election"));
        
        // Verify vote counts
        const voteCounts = analytics['vote-counts'].expectList();
        assertEquals(voteCounts.length, 2);
        assertEquals(voteCounts[0], types.uint(1)); // Option A: 1 vote
        assertEquals(voteCounts[1], types.uint(1)); // Option B: 1 vote
        
        // Verify status flags
        assertEquals(analytics['is-active'], types.bool(true));
        assertEquals(analytics['is-ended'], types.bool(false));
        
        // Verify blocks remaining is calculated
        const blocksRemaining = analytics['blocks-remaining'].expectUint();
        assertEquals(blocksRemaining > 0, true);
        
        // Verify participation rate is calculated
        const participationRate = analytics['participation-rate'].expectUint();
        assertEquals(participationRate > 0, true);
    },
});

Clarinet.test({
    name: "Analytics: get-platform-stats returns correct platform-wide statistics",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const voter1 = accounts.get('wallet_1')!;

        // Create multiple elections
        let block = chain.mineBlock([
            Tx.contractCall('voting', 'create-election', [
                types.utf8("Election 1"),
                types.list([types.utf8("Yes"), types.utf8("No")]),
                types.uint(10),
                types.uint(50),
                types.utf8("standard"),
                types.bool(false),
                types.none(),
                types.uint(0)
            ], deployer.address),
            Tx.contractCall('voting', 'create-election', [
                types.utf8("Election 2"),
                types.list([types.utf8("A"), types.utf8("B"), types.utf8("C")]),
                types.uint(20),
                types.uint(80),
                types.utf8("weighted"),
                types.bool(false),
                types.none(),
                types.uint(0)
            ], deployer.address)
        ]);
        assertEquals(block.receipts.length, 2);
        assertEquals(block.receipts[0].result.expectOk(), types.uint(1));
        assertEquals(block.receipts[1].result.expectOk(), types.uint(2));

        // Cast some votes
        block = chain.mineBlock([
            Tx.contractCall('voting', 'cast-vote', [
                types.uint(1),
                types.uint(0)
            ], voter1.address)
        ]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result.expectOk(), types.bool(true));

        // Test get-platform-stats
        let statsCall = chain.callReadOnlyFn('voting', 'get-platform-stats', [], deployer.address);
        const stats = statsCall.result.expectOk().expectTuple();
        
        // Verify total elections count
        assertEquals(stats['total-elections'], types.uint(2));
        
        // Verify current block is returned
        const currentBlock = stats['current-block'].expectUint();
        assertEquals(currentBlock > 0, true);
        
        // Verify active elections count (both should be active)
        assertEquals(stats['active-elections'], types.uint(2));
        
        // Verify total votes cast
        assertEquals(stats['total-votes-cast'], types.uint(1));
    },
});

Clarinet.test({
    name: "Analytics: get-elections-batch retrieves multiple elections efficiently",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        // Create multiple elections
        let block = chain.mineBlock([
            Tx.contractCall('voting', 'create-election', [
                types.utf8("Batch Election 1"),
                types.list([types.utf8("Option 1"), types.utf8("Option 2")]),
                types.uint(10),
                types.uint(100),
                types.utf8("standard"),
                types.bool(false),
                types.none(),
                types.uint(0)
            ], deployer.address),
            Tx.contractCall('voting', 'create-election', [
                types.utf8("Batch Election 2"),
                types.list([types.utf8("Choice A"), types.utf8("Choice B")]),
                types.uint(15),
                types.uint(105),
                types.utf8("commit-reveal"),
                types.bool(true),
                types.none(),
                types.uint(0)
            ], deployer.address)
        ]);
        assertEquals(block.receipts.length, 2);

        // Test get-elections-batch
        let batchCall = chain.callReadOnlyFn('voting', 'get-elections-batch', [
            types.list([types.uint(1), types.uint(2), types.uint(999)]) // Include non-existent election
        ], deployer.address);

        const batchResults = batchCall.result.expectOk().expectList();
        assertEquals(batchResults.length, 3);
        
        // First election should exist
        const election1 = batchResults[0].expectSome().expectTuple();
        assertEquals(election1['id'], types.uint(1));
        assertEquals(election1['question'], types.utf8("Batch Election 1"));
        
        // Second election should exist
        const election2 = batchResults[1].expectSome().expectTuple();
        assertEquals(election2['id'], types.uint(2));
        assertEquals(election2['question'], types.utf8("Batch Election 2"));
        
        // Third election should not exist
        assertEquals(batchResults[2].expectNone(), null);
    },
});

Clarinet.test({
    name: "Analytics: helper functions work correctly for counting and aggregation",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const voter1 = accounts.get('wallet_1')!;
        const voter2 = accounts.get('wallet_2')!;

        // Create elections with different statuses
        let block = chain.mineBlock([
            // Active election
            Tx.contractCall('voting', 'create-election', [
                types.utf8("Active Election"),
                types.list([types.utf8("Yes"), types.utf8("No")]),
                types.uint(10),
                types.uint(100),
                types.utf8("standard"),
                types.bool(false),
                types.none(),
                types.uint(0)
            ], deployer.address),
            // Future election (not yet active)
            Tx.contractCall('voting', 'create-election', [
                types.utf8("Future Election"),
                types.list([types.utf8("A"), types.utf8("B")]),
                types.uint(200),
                types.uint(300),
                types.utf8("standard"),
                types.bool(false),
                types.none(),
                types.uint(0)
            ], deployer.address)
        ]);
        assertEquals(block.receipts.length, 2);

        // Cast votes in the active election
        block = chain.mineBlock([
            Tx.contractCall('voting', 'cast-vote', [
                types.uint(1),
                types.uint(0)
            ], voter1.address),
            Tx.contractCall('voting', 'cast-vote', [
                types.uint(1),
                types.uint(1)
            ], voter2.address)
        ]);
        assertEquals(block.receipts.length, 2);

        // Test active elections count
        let activeCountCall = chain.callReadOnlyFn('voting', 'get-active-elections-count', [], deployer.address);
        assertEquals(activeCountCall.result, types.uint(1)); // Only one active election

        // Test total platform votes
        let totalVotesCall = chain.callReadOnlyFn('voting', 'get-total-platform-votes', [], deployer.address);
        assertEquals(totalVotesCall.result, types.uint(2)); // Two votes cast total
    },
});

Clarinet.test({
    name: "Analytics: weighted election analytics include weighted vote counts",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const voter1 = accounts.get('wallet_1')!;

        // Create a weighted election
        let block = chain.mineBlock([
            Tx.contractCall('voting', 'create-election', [
                types.utf8("Weighted Election"),
                types.list([types.utf8("Option A"), types.utf8("Option B")]),
                types.uint(10),
                types.uint(100),
                types.utf8("weighted"),
                types.bool(false),
                types.none(),
                types.uint(0)
            ], deployer.address)
        ]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result.expectOk(), types.uint(1));

        // Cast a weighted vote
        block = chain.mineBlock([
            Tx.contractCall('voting', 'cast-weighted-vote', [
                types.uint(1),
                types.uint(0),
                types.uint(5) // Weight of 5
            ], voter1.address)
        ]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result.expectOk(), types.bool(true));

        // Test analytics for weighted election
        let analyticsCall = chain.callReadOnlyFn('voting', 'get-election-analytics', [
            types.uint(1)
        ], deployer.address);

        const analytics = analyticsCall.result.expectOk().expectTuple();
        
        // Verify regular vote counts
        const voteCounts = analytics['vote-counts'].expectList();
        assertEquals(voteCounts[0], types.uint(1)); // 1 regular vote
        assertEquals(voteCounts[1], types.uint(0)); // 0 regular votes
        
        // Verify weighted vote counts
        const weightedCounts = analytics['weighted-counts'].expectList();
        assertEquals(weightedCounts[0], types.uint(5)); // 5 weighted votes
        assertEquals(weightedCounts[1], types.uint(0)); // 0 weighted votes
    },
});

Clarinet.test({
    name: "Analytics: error handling for non-existent elections",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        // Test analytics for non-existent election
        let analyticsCall = chain.callReadOnlyFn('voting', 'get-election-analytics', [
            types.uint(999)
        ], deployer.address);

        analyticsCall.result.expectErr().expectUint(404); // ERR-ELECTION-NOT-FOUND
    },
});
