# Enhanced Smart Contract API Documentation (`voting.clar`)

This document provides a comprehensive overview of the functions available in the enhanced `voting.clar` smart contract, including support for token-gated voting, weighted voting, commit-reveal schemes, and allowlisting.

## Contract Address

*   **Testnet:** (To be deployed - Placeholder: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM`)
*   **Mainnet:** (To be deployed)

*(Note: Replace placeholder address with the actual deployed address)*

## Voting Types Supported

1. **Standard Voting**: Traditional one-person-one-vote elections
2. **Token-Gated Voting**: Voting restricted to holders of specific tokens
3. **Weighted Voting**: Vote weight based on token holdings
4. **Commit-Reveal Voting**: Two-phase voting for enhanced privacy

## Public Functions (Require Transaction)

These functions modify the state of the blockchain and require a transaction signed by the user's wallet.

### `create-election`

Creates a new standard election (backward compatible).

*   **Parameters:**
    *   `question` (`(string-utf8 256)`): The text of the election question.
    *   `start-block` (`uint`): The block height when voting starts (must be >= current block height).
    *   `end-block` (`uint`): The block height when voting ends (must be > `start-block`).
    *   `options` (`(list 10 (string-utf8 64))`): A list of voting options (max 10 options, each max 64 chars).
*   **Returns:** `(ok uint)` with the new election ID on success, or an error response `(err uint)`.
*   **Errors:** `ERR-EMPTY-QUESTION`, `ERR-NO-OPTIONS`, `ERR-TOO-MANY-OPTIONS`, `ERR-INVALID-TIMES`.

### `create-election-enhanced`

Creates an enhanced election with additional features.

*   **Parameters:**
    *   `question` (`(string-utf8 256)`): The text of the election question.
    *   `start-block` (`uint`): The block height when voting starts.
    *   `end-block` (`uint`): The block height when voting ends.
    *   `options` (`(list 10 (string-utf8 64))`): A list of voting options.
    *   `voting-type` (`(string-ascii 20)`): Type of voting ("standard", "token-gated", "weighted", "commit-reveal").
    *   `token-contract` (`(optional principal)`): Token contract for token-gated/weighted voting.
    *   `min-token-balance` (`uint`): Minimum token balance required to vote.
    *   `use-allowlist` (`bool`): Whether to use allowlist for voter eligibility.
    *   `commit-end-block` (`(optional uint)`): End of commit phase for commit-reveal voting.
    *   `reveal-end-block` (`(optional uint)`): End of reveal phase for commit-reveal voting.
*   **Returns:** `(ok uint)` with the new election ID on success, or an error response `(err uint)`.
*   **Errors:** All standard errors plus `ERR-INVALID-TOKEN-CONTRACT`.

### `cast-vote`

Casts a vote in a specified election (enhanced to support all voting types except commit-reveal).

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election to vote in.
    *   `option-index` (`uint`): The 0-based index of the chosen option.
*   **Returns:** `(ok bool)` true on success, or an error response `(err uint)`.
*   **Errors:** `ERR-ELECTION-NOT-FOUND`, `ERR-ELECTION-NOT-STARTED`, `ERR-ELECTION-ENDED`, `ERR-ALREADY-VOTED`, `ERR-INVALID-OPTION`, `ERR-INSUFFICIENT-TOKENS`, `ERR-NOT-ALLOWLISTED`, `ERR-NOT-AUTHORIZED`.

### Allowlist Management Functions

#### `add-to-allowlist`

Adds a voter to the allowlist for a specific election (creator only).

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election.
    *   `voter` (`principal`): The principal to add to the allowlist.
*   **Returns:** `(ok bool)` true on success, or an error response `(err uint)`.
*   **Errors:** `ERR-ELECTION-NOT-FOUND`, `ERR-NOT-AUTHORIZED`, `ERR-ELECTION-NOT-STARTED`.

#### `remove-from-allowlist`

Removes a voter from the allowlist for a specific election (creator only).

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election.
    *   `voter` (`principal`): The principal to remove from the allowlist.
*   **Returns:** `(ok bool)` true on success, or an error response `(err uint)`.
*   **Errors:** `ERR-ELECTION-NOT-FOUND`, `ERR-NOT-AUTHORIZED`, `ERR-ELECTION-NOT-STARTED`.

#### `add-multiple-to-allowlist`

Adds multiple voters to the allowlist for a specific election (creator only).

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election.
    *   `voters` (`(list 1000 principal)`): List of principals to add to the allowlist.
*   **Returns:** `(ok bool)` true on success, or an error response `(err uint)`.
*   **Errors:** `ERR-ELECTION-NOT-FOUND`, `ERR-NOT-AUTHORIZED`, `ERR-ELECTION-NOT-STARTED`.

### Commit-Reveal Voting Functions

#### `commit-vote`

Commits a vote in a commit-reveal election during the commit phase.

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election to vote in.
    *   `commitment` (`(buff 32)`): The commitment hash (keccak256 of option-index + nonce).
*   **Returns:** `(ok bool)` true on success, or an error response `(err uint)`.
*   **Errors:** `ERR-ELECTION-NOT-FOUND`, `ERR-NOT-AUTHORIZED`, `ERR-ELECTION-NOT-STARTED`, `ERR-COMMIT-PHASE-ENDED`, `ERR-ALREADY-COMMITTED`, `ERR-INSUFFICIENT-TOKENS`, `ERR-NOT-ALLOWLISTED`.

#### `reveal-vote`

Reveals a vote in a commit-reveal election during the reveal phase.

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election to vote in.
    *   `option-index` (`uint`): The 0-based index of the chosen option.
    *   `nonce` (`(buff 32)`): The nonce used in the commitment.
*   **Returns:** `(ok bool)` true on success, or an error response `(err uint)`.
*   **Errors:** `ERR-ELECTION-NOT-FOUND`, `ERR-NOT-AUTHORIZED`, `ERR-REVEAL-PHASE-NOT-STARTED`, `ERR-REVEAL-PHASE-ENDED`, `ERR-ALREADY-REVEALED`, `ERR-INVALID-OPTION`, `ERR-INVALID-COMMITMENT`, `ERR-COMMITMENT-NOT-FOUND`.

## Read-Only Functions

These functions read data from the contract state and do not require a transaction. They can be called freely without gas fees.

### Core Election Functions

#### `get-election-details`

Retrieves the details of a specific election (enhanced with new fields).

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election.
*   **Returns:** `(optional {id: uint, question: (string-utf8 256), creator: principal, start-block: uint, end-block: uint, options: (list 10 (string-utf8 64)), total-votes: uint, voting-type: (string-ascii 20), token-contract: (optional principal), min-token-balance: uint, use-allowlist: bool, commit-end-block: (optional uint), reveal-end-block: (optional uint)})`. Returns `(some ...)` if found, `none` otherwise.

#### `get-vote-count`

Retrieves the vote count for a specific option in an election.

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election.
    *   `option-index` (`uint`): The 0-based index of the option.
*   **Returns:** `uint`: The number of votes for the option (defaults to 0).

#### `get-election-results`

Retrieves the list of vote counts for all options in an election.

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election.
*   **Returns:** `(response (list 10 uint) uint)`: Returns `(ok (list uint))` with vote counts on success, or `(err ERR-ELECTION-NOT-FOUND)`.

#### `get-election-count`

Retrieves the total number of elections created.

*   **Parameters:** None.
*   **Returns:** `(response uint uint)`: Returns `(ok uint)` with the total count.

### Enhanced Voting Functions

#### `get-weighted-vote-count`

Retrieves the weighted vote count for a specific option in a weighted election.

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election.
    *   `option-index` (`uint`): The 0-based index of the option.
*   **Returns:** `uint`: The weighted votes for the option (defaults to 0).

#### `get-weighted-election-results`

Retrieves the weighted vote results for all options in a weighted election.

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election.
*   **Returns:** `(response (list 10 uint) uint)`: Returns `(ok (list uint))` with weighted vote counts on success, or `(err ERR-ELECTION-NOT-FOUND)`.

### Voter Status Functions

#### `has-voted`

Checks if a specific voter has already voted in an election.

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election.
    *   `voter` (`principal`): The Stacks address of the voter to check.
*   **Returns:** `bool`: `true` if the voter has voted, `false` otherwise.

#### `is-allowlisted`

Checks if a voter is on the allowlist for a specific election.

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election.
    *   `voter` (`principal`): The principal address of the voter to check.
*   **Returns:** `bool`: `true` if the voter is allowlisted, `false` otherwise.

#### `has-committed`

Checks if a voter has committed in a commit-reveal election.

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election.
    *   `voter` (`principal`): The principal address of the voter to check.
*   **Returns:** `bool`: `true` if the voter has committed, `false` otherwise.

#### `has-revealed`

Checks if a voter has revealed in a commit-reveal election.

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election.
    *   `voter` (`principal`): The principal address of the voter to check.
*   **Returns:** `bool`: `true` if the voter has revealed, `false` otherwise.

## Enhanced Data Maps

*   `elections`: Stores enhanced election details with new fields for voting type, token requirements, and timing.
*   `vote-counts`: Stores regular vote counts keyed by `{election-id, option-index}`.
*   `voter-tracker`: Stores whether a voter has voted, keyed by `{election-id, voter}`.
*   `election-allowlist`: Stores allowlisted voters keyed by `{election-id, voter}`.
*   `vote-commitments`: Stores vote commitments for commit-reveal elections keyed by `{election-id, voter}`.
*   `vote-reveals`: Tracks revealed votes keyed by `{election-id, voter}`.
*   `weighted-vote-counts`: Stores weighted vote counts keyed by `{election-id, option-index}`.

## Data Variables

*   `election-id-counter`: Tracks the next available election ID.

## Error Codes

### Standard Errors (100-110)
*   `ERR-NOT-AUTHORIZED` (100): User is not authorized to perform the action
*   `ERR-ELECTION-NOT-FOUND` (101): The specified election ID does not exist
*   `ERR-ELECTION-ALREADY-EXISTS` (102): Attempted to create an election with an existing ID
*   `ERR-ELECTION-NOT-STARTED` (103): Attempted to vote before the election's start block
*   `ERR-ELECTION-ENDED` (104): Attempted to vote after the election's end block
*   `ERR-ALREADY-VOTED` (105): The voter has already cast a vote in this election
*   `ERR-INVALID-OPTION` (106): The selected option index is out of bounds
*   `ERR-INVALID-TIMES` (107): Invalid timing configuration
*   `ERR-EMPTY-QUESTION` (108): The election question cannot be empty
*   `ERR-NO-OPTIONS` (109): At least one voting option must be provided
*   `ERR-TOO-MANY-OPTIONS` (110): Exceeded the maximum allowed number of options

### Enhanced Feature Errors (111-120)
*   `ERR-INSUFFICIENT-TOKENS` (111): Voter does not hold required tokens
*   `ERR-NOT-ALLOWLISTED` (112): Voter is not on the allowlist
*   `ERR-INVALID-TOKEN-CONTRACT` (113): Invalid token contract specified
*   `ERR-COMMIT-PHASE-ENDED` (114): Commit phase has ended
*   `ERR-REVEAL-PHASE-NOT-STARTED` (115): Reveal phase has not started
*   `ERR-REVEAL-PHASE-ENDED` (116): Reveal phase has ended
*   `ERR-INVALID-COMMITMENT` (117): Invalid commitment hash
*   `ERR-COMMITMENT-NOT-FOUND` (118): No commitment found for voter
*   `ERR-ALREADY-COMMITTED` (119): Voter has already committed
*   `ERR-ALREADY-REVEALED` (120): Voter has already revealed

## Events Emitted

The contract emits comprehensive events for off-chain indexing:

*   `create-election-enhanced`: When an enhanced election is created
*   `add-to-allowlist`: When a voter is added to an allowlist
*   `remove-from-allowlist`: When a voter is removed from an allowlist
*   `add-multiple-to-allowlist`: When multiple voters are added to an allowlist
*   `commit-vote`: When a vote is committed in commit-reveal voting
*   `reveal-vote`: When a vote is revealed in commit-reveal voting
*   `cast-vote`: When a standard vote is cast
*   `cast-weighted-vote`: When a weighted vote is cast
