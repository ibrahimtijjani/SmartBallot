;; Decentralized Voting Smart Contract
;; Allows creation of elections, casting votes, and tallying results.
;; Enhanced with token-gated voting, weighted voting, commit-reveal schemes, and allowlisting.

;; --- Constants ---
;; Error codes used throughout the contract
(define-constant ERR-NOT-AUTHORIZED (err u100)) ;; User is not authorized to perform the action
(define-constant ERR-ELECTION-NOT-FOUND (err u101)) ;; The specified election ID does not exist
(define-constant ERR-ELECTION-ALREADY-EXISTS (err u102)) ;; Attempted to create an election with an ID that already exists (should not happen with counter)
(define-constant ERR-ELECTION-NOT-STARTED (err u103)) ;; Attempted to vote before the election's start block
(define-constant ERR-ELECTION-ENDED (err u104)) ;; Attempted to vote after the election's end block
(define-constant ERR-ALREADY-VOTED (err u105)) ;; The voter has already cast a vote in this election
(define-constant ERR-INVALID-OPTION (err u106)) ;; The selected option index is out of bounds
(define-constant ERR-INVALID-TIMES (err u107)) ;; Start block is not before end block, or start block is in the past
(define-constant ERR-EMPTY-QUESTION (err u108)) ;; The election question cannot be empty
(define-constant ERR-NO-OPTIONS (err u109)) ;; At least one voting option must be provided
(define-constant ERR-TOO-MANY-OPTIONS (err u110)) ;; Exceeded the maximum allowed number of options

;; New error codes for enhanced functionality
(define-constant ERR-INSUFFICIENT-TOKENS (err u111)) ;; Voter does not hold required tokens
(define-constant ERR-NOT-ALLOWLISTED (err u112)) ;; Voter is not on the allowlist
(define-constant ERR-INVALID-TOKEN-CONTRACT (err u113)) ;; Invalid token contract specified
(define-constant ERR-COMMIT-PHASE-ENDED (err u114)) ;; Commit phase has ended
(define-constant ERR-REVEAL-PHASE-NOT-STARTED (err u115)) ;; Reveal phase has not started
(define-constant ERR-REVEAL-PHASE-ENDED (err u116)) ;; Reveal phase has ended
(define-constant ERR-INVALID-COMMITMENT (err u117)) ;; Invalid commitment hash
(define-constant ERR-COMMITMENT-NOT-FOUND (err u118)) ;; No commitment found for voter
(define-constant ERR-ALREADY-COMMITTED (err u119)) ;; Voter has already committed
(define-constant ERR-ALREADY-REVEALED (err u120)) ;; Voter has already revealed

;; Configuration Constants
(define-constant MAX_OPTIONS u10) ;; Maximum number of voting options allowed per election
(define-constant MAX_ALLOWLIST_SIZE u1000) ;; Maximum number of addresses in allowlist

;; --- Data Storage ---

;; Stores the details for each election, keyed by a unique election ID (uint).
(define-map elections uint {
    id: uint, ;; Unique identifier for the election
    question: (string-utf8 256), ;; The question being voted on
    creator: principal, ;; The principal (Stacks address) that created the election
    start-block: uint, ;; The block height at which voting begins
    end-block: uint, ;; The block height at which voting ends
    options: (list MAX_OPTIONS (string-utf8 64)), ;; List of voting options (strings)
    total-votes: uint, ;; Counter for the total number of votes cast in this election
    ;; Enhanced features
    voting-type: (string-ascii 20), ;; "standard", "token-gated", "weighted", "commit-reveal"
    token-contract: (optional principal), ;; Token contract for token-gated/weighted voting
    min-token-balance: uint, ;; Minimum token balance required to vote
    use-allowlist: bool, ;; Whether to use allowlist for voter eligibility
    commit-end-block: (optional uint), ;; End of commit phase for commit-reveal voting
    reveal-end-block: (optional uint) ;; End of reveal phase for commit-reveal voting
})

;; Stores the vote count for each option within each election.
;; Key: A tuple containing the election ID and the index of the option.
;; Value: The number of votes received by that option (uint).
(define-map vote-counts { election-id: uint, option-index: uint } uint)

;; Tracks whether a specific principal has already voted in a given election.
;; Key: A tuple containing the election ID and the voter's principal.
;; Value: A boolean (true) indicating the principal has voted.
(define-map voter-tracker { election-id: uint, voter: principal } bool)

;; Stores allowlisted voters for each election
;; Key: A tuple containing the election ID and the voter's principal.
;; Value: A boolean (true) indicating the principal is allowlisted.
(define-map election-allowlist { election-id: uint, voter: principal } bool)

;; Stores vote commitments for commit-reveal elections
;; Key: A tuple containing the election ID and the voter's principal.
;; Value: The commitment hash (buff 32).
(define-map vote-commitments { election-id: uint, voter: principal } (buff 32))

;; Tracks whether a voter has revealed their vote in commit-reveal elections
;; Key: A tuple containing the election ID and the voter's principal.
;; Value: A boolean (true) indicating the vote has been revealed.
(define-map vote-reveals { election-id: uint, voter: principal } bool)

;; Stores weighted vote counts for weighted voting elections
;; Key: A tuple containing the election ID and the option index.
;; Value: The total weighted votes for that option.
(define-map weighted-vote-counts { election-id: uint, option-index: uint } uint)

;; A counter to generate unique IDs for new elections.
(define-data-var election-id-counter uint u0)

;; --- Public Functions ---

;; Creates a standard election with the specified details.
;; @param question: The text of the election question (max 256 UTF8 chars).
;; @param start-block: The block height when voting starts (must be >= current block height).
;; @param end-block: The block height when voting ends (must be > start-block).
;; @param options: A list of voting options (strings, max 64 UTF8 chars each, max MAX_OPTIONS items).
;; @returns (ok uint) with the new election ID on success, or an error code.
(define-public (create-election (question (string-utf8 256)) (start-block uint) (end-block uint) (options (list MAX_OPTIONS (string-utf8 64))))
    (create-election-enhanced question start-block end-block options "standard" none u0 false none none)
)

;; Creates an enhanced election with additional features.
;; @param question: The text of the election question (max 256 UTF8 chars).
;; @param start-block: The block height when voting starts (must be >= current block height).
;; @param end-block: The block height when voting ends (must be > start-block).
;; @param options: A list of voting options (strings, max 64 UTF8 chars each, max MAX_OPTIONS items).
;; @param voting-type: Type of voting ("standard", "token-gated", "weighted", "commit-reveal").
;; @param token-contract: Optional token contract for token-gated/weighted voting.
;; @param min-token-balance: Minimum token balance required to vote (0 for standard voting).
;; @param use-allowlist: Whether to use allowlist for voter eligibility.
;; @param commit-end-block: Optional end of commit phase for commit-reveal voting.
;; @param reveal-end-block: Optional end of reveal phase for commit-reveal voting.
;; @returns (ok uint) with the new election ID on success, or an error code.
(define-public (create-election-enhanced
    (question (string-utf8 256))
    (start-block uint)
    (end-block uint)
    (options (list MAX_OPTIONS (string-utf8 64)))
    (voting-type (string-ascii 20))
    (token-contract (optional principal))
    (min-token-balance uint)
    (use-allowlist bool)
    (commit-end-block (optional uint))
    (reveal-end-block (optional uint)))
    (begin
        ;; Input Validations
        (asserts! (not (is-eq question "")) ERR-EMPTY-QUESTION)
        (asserts! (> (len options) u0) ERR-NO-OPTIONS)
        (asserts! (<= (len options) MAX_OPTIONS) ERR-TOO-MANY-OPTIONS)
        (asserts! (< start-block end-block) ERR-INVALID-TIMES)
        (asserts! (>= start-block block-height) ERR-INVALID-TIMES)

        ;; Validate commit-reveal timing if applicable
        (if (is-eq voting-type "commit-reveal")
            (begin
                (asserts! (is-some commit-end-block) ERR-INVALID-TIMES)
                (asserts! (is-some reveal-end-block) ERR-INVALID-TIMES)
                (asserts! (< start-block (unwrap-panic commit-end-block)) ERR-INVALID-TIMES)
                (asserts! (< (unwrap-panic commit-end-block) (unwrap-panic reveal-end-block)) ERR-INVALID-TIMES)
                (asserts! (<= (unwrap-panic reveal-end-block) end-block) ERR-INVALID-TIMES)
            )
            true
        )

        ;; Generate new ID and store election data
        (let ((new-election-id (+ (var-get election-id-counter) u1)))
            (map-insert elections new-election-id {
                id: new-election-id,
                question: question,
                creator: tx-sender,
                start-block: start-block,
                end-block: end-block,
                options: options,
                total-votes: u0,
                voting-type: voting-type,
                token-contract: token-contract,
                min-token-balance: min-token-balance,
                use-allowlist: use-allowlist,
                commit-end-block: commit-end-block,
                reveal-end-block: reveal-end-block
            })
            (var-set election-id-counter new-election-id)

            ;; Initialize vote counts for all options to 0
            (fold init-option-count options new-election-id)

            ;; Initialize weighted vote counts if needed
            (if (is-eq voting-type "weighted")
                (fold init-weighted-option-count options new-election-id)
                new-election-id
            )

            ;; Emit enhanced event
            (print {
                action: "create-election-enhanced",
                id: new-election-id,
                creator: tx-sender,
                voting-type: voting-type,
                token-contract: token-contract,
                use-allowlist: use-allowlist
            })
            (ok new-election-id)
        )
    )
)

;; Adds a voter to the allowlist for a specific election.
;; Only the election creator can add voters to the allowlist.
;; @param election-id: The ID of the election.
;; @param voter: The principal to add to the allowlist.
;; @returns (ok bool) true on success, or an error code.
(define-public (add-to-allowlist (election-id uint) (voter principal))
    (let ((election (unwrap! (map-get? elections election-id) ERR-ELECTION-NOT-FOUND)))
        ;; Only the election creator can modify the allowlist
        (asserts! (is-eq tx-sender (get creator election)) ERR-NOT-AUTHORIZED)
        ;; Election must use allowlist
        (asserts! (get use-allowlist election) ERR-NOT-AUTHORIZED)
        ;; Cannot modify allowlist after voting has started
        (asserts! (< block-height (get start-block election)) ERR-ELECTION-NOT-STARTED)

        ;; Add voter to allowlist
        (map-set election-allowlist { election-id: election-id, voter: voter } true)

        ;; Emit event
        (print { action: "add-to-allowlist", election-id: election-id, voter: voter, creator: tx-sender })
        (ok true)
    )
)

;; Removes a voter from the allowlist for a specific election.
;; Only the election creator can remove voters from the allowlist.
;; @param election-id: The ID of the election.
;; @param voter: The principal to remove from the allowlist.
;; @returns (ok bool) true on success, or an error code.
(define-public (remove-from-allowlist (election-id uint) (voter principal))
    (let ((election (unwrap! (map-get? elections election-id) ERR-ELECTION-NOT-FOUND)))
        ;; Only the election creator can modify the allowlist
        (asserts! (is-eq tx-sender (get creator election)) ERR-NOT-AUTHORIZED)
        ;; Election must use allowlist
        (asserts! (get use-allowlist election) ERR-NOT-AUTHORIZED)
        ;; Cannot modify allowlist after voting has started
        (asserts! (< block-height (get start-block election)) ERR-ELECTION-NOT-STARTED)

        ;; Remove voter from allowlist
        (map-delete election-allowlist { election-id: election-id, voter: voter })

        ;; Emit event
        (print { action: "remove-from-allowlist", election-id: election-id, voter: voter, creator: tx-sender })
        (ok true)
    )
)

;; Adds multiple voters to the allowlist for a specific election.
;; Only the election creator can add voters to the allowlist.
;; @param election-id: The ID of the election.
;; @param voters: List of principals to add to the allowlist.
;; @returns (ok bool) true on success, or an error code.
(define-public (add-multiple-to-allowlist (election-id uint) (voters (list MAX_ALLOWLIST_SIZE principal)))
    (let ((election (unwrap! (map-get? elections election-id) ERR-ELECTION-NOT-FOUND)))
        ;; Only the election creator can modify the allowlist
        (asserts! (is-eq tx-sender (get creator election)) ERR-NOT-AUTHORIZED)
        ;; Election must use allowlist
        (asserts! (get use-allowlist election) ERR-NOT-AUTHORIZED)
        ;; Cannot modify allowlist after voting has started
        (asserts! (< block-height (get start-block election)) ERR-ELECTION-NOT-STARTED)

        ;; Add all voters to allowlist
        (fold add-voter-to-allowlist voters election-id)

        ;; Emit event
        (print { action: "add-multiple-to-allowlist", election-id: election-id, count: (len voters), creator: tx-sender })
        (ok true)
    )
)

;; Commits a vote in a commit-reveal election.
;; @param election-id: The ID of the election to vote in.
;; @param commitment: The commitment hash (keccak256 of option-index + nonce).
;; @returns (ok bool) true on successful commit, or an error code.
(define-public (commit-vote (election-id uint) (commitment (buff 32)))
    (let (
        (voter tx-sender)
        (election (unwrap! (map-get? elections election-id) ERR-ELECTION-NOT-FOUND))
        (current-block block-height)
    )
        ;; Validate election type
        (asserts! (is-eq (get voting-type election) "commit-reveal") ERR-NOT-AUTHORIZED)

        ;; Check timing - must be in commit phase
        (asserts! (>= current-block (get start-block election)) ERR-ELECTION-NOT-STARTED)
        (asserts! (< current-block (unwrap! (get commit-end-block election) ERR-INVALID-TIMES)) ERR-COMMIT-PHASE-ENDED)

        ;; Check if voter has already committed
        (asserts! (is-none (map-get? vote-commitments { election-id: election-id, voter: voter })) ERR-ALREADY-COMMITTED)

        ;; Validate voter eligibility
        (try! (validate-voter-eligibility election-id voter election))

        ;; Store commitment
        (map-set vote-commitments { election-id: election-id, voter: voter } commitment)

        ;; Emit event
        (print { action: "commit-vote", election-id: election-id, voter: voter })
        (ok true)
    )
)

;; Reveals a vote in a commit-reveal election.
;; @param election-id: The ID of the election to vote in.
;; @param option-index: The 0-based index of the chosen option.
;; @param nonce: The nonce used in the commitment.
;; @returns (ok bool) true on successful reveal, or an error code.
(define-public (reveal-vote (election-id uint) (option-index uint) (nonce (buff 32)))
    (let (
        (voter tx-sender)
        (election (unwrap! (map-get? elections election-id) ERR-ELECTION-NOT-FOUND))
        (current-block block-height)
        (stored-commitment (unwrap! (map-get? vote-commitments { election-id: election-id, voter: voter }) ERR-COMMITMENT-NOT-FOUND))
    )
        ;; Validate election type
        (asserts! (is-eq (get voting-type election) "commit-reveal") ERR-NOT-AUTHORIZED)

        ;; Check timing - must be in reveal phase
        (asserts! (>= current-block (unwrap! (get commit-end-block election) ERR-INVALID-TIMES)) ERR-REVEAL-PHASE-NOT-STARTED)
        (asserts! (< current-block (unwrap! (get reveal-end-block election) ERR-INVALID-TIMES)) ERR-REVEAL-PHASE-ENDED)

        ;; Check if voter has already revealed
        (asserts! (is-none (map-get? vote-reveals { election-id: election-id, voter: voter })) ERR-ALREADY-REVEALED)

        ;; Validate option index
        (asserts! (< option-index (len (get options election))) ERR-INVALID-OPTION)

        ;; Verify commitment
        (let ((computed-commitment (keccak256 (concat (int-to-ascii option-index) nonce))))
            (asserts! (is-eq stored-commitment computed-commitment) ERR-INVALID-COMMITMENT)
        )

        ;; Record the vote
        (let ((current-count (default-to u0 (map-get? vote-counts { election-id: election-id, option-index: option-index }))))
            (map-set vote-counts { election-id: election-id, option-index: option-index } (+ current-count u1))
        )

        ;; Mark as revealed
        (map-set vote-reveals { election-id: election-id, voter: voter } true)

        ;; Update total votes
        (map-set elections election-id (merge election { total-votes: (+ (get total-votes election) u1) }))

        ;; Emit event
        (print { action: "reveal-vote", election-id: election-id, voter: voter, option: option-index })
        (ok true)
    )
)

;; Allows the transaction sender to cast a vote in a specified election.
;; Enhanced to support different voting types (standard, token-gated, weighted).
;; @param election-id: The ID of the election to vote in.
;; @param option-index: The 0-based index of the chosen option in the election's options list.
;; @returns (ok bool) true on successful vote, or an error code.
(define-public (cast-vote (election-id uint) (option-index uint))
    (let (
        (voter tx-sender)
        (election (unwrap! (map-get? elections election-id) ERR-ELECTION-NOT-FOUND))
        (current-block block-height)
        (voting-type (get voting-type election))
    )
        ;; Pre-conditions for voting
        (asserts! (>= current-block (get start-block election)) ERR-ELECTION-NOT-STARTED)
        (asserts! (< current-block (get end-block election)) ERR-ELECTION-ENDED)
        (asserts! (is-none (map-get? voter-tracker { election-id: election-id, voter: voter })) ERR-ALREADY-VOTED)
        (asserts! (< option-index (len (get options election))) ERR-INVALID-OPTION)

        ;; Commit-reveal elections use different functions
        (asserts! (not (is-eq voting-type "commit-reveal")) ERR-NOT-AUTHORIZED)

        ;; Validate voter eligibility
        (try! (validate-voter-eligibility election-id voter election))

        ;; Record the vote based on voting type
        (if (is-eq voting-type "weighted")
            ;; Weighted voting
            (let ((vote-weight (try! (get-voter-weight election voter))))
                ;; Update weighted vote counts
                (let ((current-weighted-count (default-to u0 (map-get? weighted-vote-counts { election-id: election-id, option-index: option-index }))))
                    (map-set weighted-vote-counts { election-id: election-id, option-index: option-index } (+ current-weighted-count vote-weight))
                )
                ;; Also update regular vote counts for compatibility
                (let ((current-count (default-to u0 (map-get? vote-counts { election-id: election-id, option-index: option-index }))))
                    (map-set vote-counts { election-id: election-id, option-index: option-index } (+ current-count u1))
                )
                ;; Emit weighted vote event
                (print { action: "cast-weighted-vote", election-id: election-id, voter: voter, option: option-index, weight: vote-weight })
            )
            ;; Standard or token-gated voting
            (begin
                (let ((current-count (default-to u0 (map-get? vote-counts { election-id: election-id, option-index: option-index }))))
                    (map-set vote-counts { election-id: election-id, option-index: option-index } (+ current-count u1))
                )
                ;; Emit standard vote event
                (print { action: "cast-vote", election-id: election-id, voter: voter, option: option-index })
            )
        )

        ;; Mark the voter as having voted in this election
        (map-set voter-tracker { election-id: election-id, voter: voter } true)

        ;; Increment the total vote count for the election
        (map-set elections election-id (merge election { total-votes: (+ (get total-votes election) u1) }))

        (ok true)
    )
)

;; --- Read-Only Functions ---

;; Retrieves the details of a specific election.
;; @param election-id: The ID of the election to query.
;; @returns (some ElectionData) if found, (none) otherwise.
(define-read-only (get-election-details (election-id uint))
    (map-get? elections election-id)
)

;; Retrieves the current vote count for a specific option within an election.
;; @param election-id: The ID of the election.
;; @param option-index: The 0-based index of the option.
;; @returns uint: The number of votes for the specified option (defaults to 0 if not found).
(define-read-only (get-vote-count (election-id uint) (option-index uint))
    (default-to u0 (map-get? vote-counts { election-id: election-id, option-index: option-index }))
)

;; Retrieves the list of vote counts for all options in an election.
;; The order of counts corresponds to the order of options in the election details.
;; @param election-id: The ID of the election.
;; @returns (ok (list uint)) containing vote counts for each option, or (err ERR-ELECTION-NOT-FOUND).
(define-read-only (get-election-results (election-id uint))
    (match (map-get? elections election-id)
        ;; If election data is found
        election-data
        (let ((options (get options election-data)))
             ;; Map over the indices of the options list and get the count for each index
             (ok (map (lambda (index) (get-vote-count election-id index)) (list-indices options)))
        )
        ;; If election data is not found
        (err ERR-ELECTION-NOT-FOUND)
    )
)

;; Checks if a specific principal (voter) has already voted in a given election.
;; @param election-id: The ID of the election.
;; @param voter: The principal address of the voter to check.
;; @returns bool: true if the voter has voted, false otherwise.
(define-read-only (has-voted (election-id uint) (voter principal))
    (is-some (map-get? voter-tracker { election-id: election-id, voter: voter }))
)

;; Retrieves the total number of elections created so far.
;; @returns (ok uint): The current value of the election ID counter.
(define-read-only (get-election-count)
    (ok (var-get election-id-counter))
)

;; Retrieves the weighted vote count for a specific option within an election.
;; @param election-id: The ID of the election.
;; @param option-index: The 0-based index of the option.
;; @returns uint: The weighted votes for the specified option (defaults to 0 if not found).
(define-read-only (get-weighted-vote-count (election-id uint) (option-index uint))
    (default-to u0 (map-get? weighted-vote-counts { election-id: election-id, option-index: option-index }))
)

;; Retrieves the weighted vote results for all options in an election.
;; @param election-id: The ID of the election.
;; @returns (ok (list uint)) containing weighted vote counts for each option, or (err ERR-ELECTION-NOT-FOUND).
(define-read-only (get-weighted-election-results (election-id uint))
    (match (map-get? elections election-id)
        election-data
        (let ((options (get options election-data)))
             (ok (map (lambda (index) (get-weighted-vote-count election-id index)) (list-indices options)))
        )
        (err ERR-ELECTION-NOT-FOUND)
    )
)

;; Checks if a voter is on the allowlist for a specific election.
;; @param election-id: The ID of the election.
;; @param voter: The principal address of the voter to check.
;; @returns bool: true if the voter is allowlisted, false otherwise.
(define-read-only (is-allowlisted (election-id uint) (voter principal))
    (is-some (map-get? election-allowlist { election-id: election-id, voter: voter }))
)

;; Checks if a voter has committed in a commit-reveal election.
;; @param election-id: The ID of the election.
;; @param voter: The principal address of the voter to check.
;; @returns bool: true if the voter has committed, false otherwise.
(define-read-only (has-committed (election-id uint) (voter principal))
    (is-some (map-get? vote-commitments { election-id: election-id, voter: voter }))
)

;; Checks if a voter has revealed in a commit-reveal election.
;; @param election-id: The ID of the election.
;; @param voter: The principal address of the voter to check.
;; @returns bool: true if the voter has revealed, false otherwise.
(define-read-only (has-revealed (election-id uint) (voter principal))
    (is-some (map-get? vote-reveals { election-id: election-id, voter: voter }))
)

;; --- Private Helper Functions ---

;; Validates voter eligibility based on election settings.
;; @param election-id: The ID of the election.
;; @param voter: The principal address of the voter.
;; @param election: The election data.
;; @returns (ok bool) true if eligible, or an error code.
(define-private (validate-voter-eligibility (election-id uint) (voter principal) (election { id: uint, question: (string-utf8 256), creator: principal, start-block: uint, end-block: uint, options: (list 10 (string-utf8 64)), total-votes: uint, voting-type: (string-ascii 20), token-contract: (optional principal), min-token-balance: uint, use-allowlist: bool, commit-end-block: (optional uint), reveal-end-block: (optional uint) }))
    (begin
        ;; Check allowlist if enabled
        (if (get use-allowlist election)
            (asserts! (is-allowlisted election-id voter) ERR-NOT-ALLOWLISTED)
            true
        )

        ;; Check token requirements for token-gated and weighted voting
        (if (or (is-eq (get voting-type election) "token-gated") (is-eq (get voting-type election) "weighted"))
            (match (get token-contract election)
                token-contract-addr
                (begin
                    ;; Check if voter has minimum token balance
                    (let ((balance (try! (get-token-balance token-contract-addr voter))))
                        (asserts! (>= balance (get min-token-balance election)) ERR-INSUFFICIENT-TOKENS)
                    )
                    (ok true)
                )
                (err ERR-INVALID-TOKEN-CONTRACT)
            )
            (ok true)
        )
    )
)

;; Gets the voting weight for a voter in weighted elections.
;; @param election: The election data.
;; @param voter: The principal address of the voter.
;; @returns (ok uint) the voting weight, or an error code.
(define-private (get-voter-weight (election { id: uint, question: (string-utf8 256), creator: principal, start-block: uint, end-block: uint, options: (list 10 (string-utf8 64)), total-votes: uint, voting-type: (string-ascii 20), token-contract: (optional principal), min-token-balance: uint, use-allowlist: bool, commit-end-block: (optional uint), reveal-end-block: (optional uint) }) (voter principal))
    (if (is-eq (get voting-type election) "weighted")
        (match (get token-contract election)
            token-contract-addr
            (get-token-balance token-contract-addr voter)
            (err ERR-INVALID-TOKEN-CONTRACT)
        )
        (ok u1) ;; Default weight for non-weighted elections
    )
)

;; Gets the token balance for a voter from a token contract.
;; This is a placeholder - in a real implementation, this would call the token contract.
;; @param token-contract: The token contract principal.
;; @param voter: The voter's principal.
;; @returns (ok uint) the token balance, or an error code.
(define-private (get-token-balance (token-contract principal) (voter principal))
    ;; Placeholder implementation - in reality, this would call:
    ;; (contract-call? token-contract get-balance voter)
    ;; For now, return a default balance for testing
    (ok u100)
)

;; Helper function to add a single voter to allowlist (used with fold).
;; @param voter: The voter to add.
;; @param election-id: The election ID (accumulator).
;; @returns uint: The election-id (passed through as accumulator).
(define-private (add-voter-to-allowlist (voter principal) (election-id uint))
    (begin
        (map-set election-allowlist { election-id: election-id, voter: voter } true)
        election-id
    )
)

;; Helper function used with `fold` during election creation to initialize
;; the vote count for each option to zero in the `vote-counts` map.
;; @param option: The current option string being processed (unused here, but required by fold).
;; @param election-id: The ID of the election being initialized (accumulator).
;; @returns uint: The election-id (passed through as accumulator).
(define-private (init-option-count (option (string-utf8 64)) (election-id uint))
    (let ( ;; Find the index of the current option within the election's options list
          (option-index (index-of option (get options (unwrap! (map-get? elections election-id) ERR-ELECTION-NOT-FOUND)))))
        )
        (match option-index
            ;; If index is found, insert 0 count into the map
            index (map-insert vote-counts { election-id: election-id, option-index: index } u0)
            ;; This should theoretically never happen if options list is consistent
            none (panic "Option index not found during init - should not happen")
        )
        election-id ;; Return the accumulator for the fold operation
    )
)

;; Helper function to initialize weighted vote counts for each option.
;; @param option: The current option string being processed.
;; @param election-id: The ID of the election being initialized (accumulator).
;; @returns uint: The election-id (passed through as accumulator).
(define-private (init-weighted-option-count (option (string-utf8 64)) (election-id uint))
    (let ((option-index (index-of option (get options (unwrap! (map-get? elections election-id) ERR-ELECTION-NOT-FOUND)))))
        (match option-index
            index (map-insert weighted-vote-counts { election-id: election-id, option-index: index } u0)
            none (panic "Option index not found during weighted init - should not happen")
        )
        election-id
    )
)

;; Helper function to convert uint to ASCII string for commitment hashing.
;; @param num: The uint to convert.
;; @returns (buff 32): ASCII representation as buffer.
(define-private (int-to-ascii (num uint))
    ;; Simple implementation for small numbers (0-9)
    ;; In a production system, this would handle larger numbers
    (if (is-eq num u0) (as-max-len? "0" u32)
    (if (is-eq num u1) (as-max-len? "1" u32)
    (if (is-eq num u2) (as-max-len? "2" u32)
    (if (is-eq num u3) (as-max-len? "3" u32)
    (if (is-eq num u4) (as-max-len? "4" u32)
    (if (is-eq num u5) (as-max-len? "5" u32)
    (if (is-eq num u6) (as-max-len? "6" u32)
    (if (is-eq num u7) (as-max-len? "7" u32)
    (if (is-eq num u8) (as-max-len? "8" u32)
    (if (is-eq num u9) (as-max-len? "9" u32)
    (as-max-len? "X" u32) ;; Fallback for numbers > 9
    ))))))))))
)

;; Helper function to generate a list of indices [0, 1, ..., len-1] for a given list.
;; Used by `get-election-results` to iterate through options.
;; @param lst: The list for which to generate indices.
;; @returns (list uint): A list of integers from 0 up to (length of lst - 1).
(define-private (list-indices (lst (list MAX_OPTIONS (string-utf8 64))))
    (list-indices-helper (len lst) u0)
)

;; Recursive helper for `list-indices`.
;; @param len: The total length of the original list.
;; @param current: The current index being added.
;; @returns (list uint): The recursively built list of indices.
(define-private (list-indices-helper (len uint) (current uint))
    (if (is-eq current len)
        (list) ;; Base case: current index reaches length, return empty list
        (cons current (list-indices-helper len (+ current u1))) ;; Recursive step: add current index and call for next
    )
)

