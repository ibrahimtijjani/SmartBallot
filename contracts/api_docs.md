# Smart Contract API Documentation (`voting.clar`)

This document provides an overview of the functions available in the `voting.clar` smart contract.

## Contract Address

*   **Testnet:** (To be deployed - Placeholder: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM`)
*   **Mainnet:** (To be deployed)

*(Note: Replace placeholder address with the actual deployed address)*

## Public Functions (Require Transaction)

These functions modify the state of the blockchain and require a transaction signed by the user's wallet.

### `create-election`

Creates a new election.

*   **Parameters:**
    *   `question` (`(string-utf8 256)`): The text of the election question.
    *   `start-block` (`uint`): The block height when voting starts (must be >= current block height).
    *   `end-block` (`uint`): The block height when voting ends (must be > `start-block`).
    *   `options` (`(list 10 (string-utf8 64))`): A list of voting options (max 10 options, each max 64 chars).
*   **Returns:** `(ok uint)` with the new election ID on success, or an error response `(err uint)`.
*   **Errors:** `ERR-EMPTY-QUESTION`, `ERR-NO-OPTIONS`, `ERR-TOO-MANY-OPTIONS`, `ERR-INVALID-TIMES`.

### `cast-vote`

Casts a vote in a specified election.

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election to vote in.
    *   `option-index` (`uint`): The 0-based index of the chosen option.
*   **Returns:** `(ok bool)` true on success, or an error response `(err uint)`.
*   **Errors:** `ERR-ELECTION-NOT-FOUND`, `ERR-ELECTION-NOT-STARTED`, `ERR-ELECTION-ENDED`, `ERR-ALREADY-VOTED`, `ERR-INVALID-OPTION`.

## Read-Only Functions

These functions read data from the contract state and do not require a transaction. They can be called freely without gas fees.

### `get-election-details`

Retrieves the details of a specific election.

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election.
*   **Returns:** `(optional {id: uint, question: (string-utf8 256), creator: principal, start-block: uint, end-block: uint, options: (list 10 (string-utf8 64)), total-votes: uint})`. Returns `(some ...)` if found, `none` otherwise.

### `get-vote-count`

Retrieves the vote count for a specific option in an election.

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election.
    *   `option-index` (`uint`): The 0-based index of the option.
*   **Returns:** `uint`: The number of votes for the option (defaults to 0).

### `get-election-results`

Retrieves the list of vote counts for all options in an election.

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election.
*   **Returns:** `(response (list 10 uint) uint)`: Returns `(ok (list uint))` with vote counts on success, or `(err ERR-ELECTION-NOT-FOUND)`.

### `has-voted`

Checks if a specific voter has already voted in an election.

*   **Parameters:**
    *   `election-id` (`uint`): The ID of the election.
    *   `voter` (`principal`): The Stacks address of the voter to check.
*   **Returns:** `bool`: `true` if the voter has voted, `false` otherwise.

### `get-election-count`

Retrieves the total number of elections created.

*   **Parameters:** None.
*   **Returns:** `(response uint uint)`: Returns `(ok uint)` with the total count.

## Data Maps

*   `elections`: Stores election details keyed by election ID.
*   `vote-counts`: Stores vote counts keyed by `{election-id, option-index}`.
*   `voter-tracker`: Stores whether a voter has voted, keyed by `{election-id, voter}`.

## Data Variables

*   `election-id-counter`: Tracks the next available election ID.
