;; Decentralized Voting Smart Contract
;; Allows creation of elections, casting votes, and tallying results.

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

;; Configuration Constants
(define-constant MAX_OPTIONS u10) ;; Maximum number of voting options allowed per election

;; --- Data Storage ---

;; Stores the details for each election, keyed by a unique election ID (uint).
(define-map elections uint {
    id: uint, ;; Unique identifier for the election
    question: (string-utf8 256), ;; The question being voted on
    creator: principal, ;; The principal (Stacks address) that created the election
    start-block: uint, ;; The block height at which voting begins
    end-block: uint, ;; The block height at which voting ends
    options: (list MAX_OPTIONS (string-utf8 64)), ;; List of voting options (strings)
    total-votes: uint ;; Counter for the total number of votes cast in this election
})

;; Stores the vote count for each option within each election.
;; Key: A tuple containing the election ID and the index of the option.
;; Value: The number of votes received by that option (uint).
(define-map vote-counts { election-id: uint, option-index: uint } uint)

;; Tracks whether a specific principal has already voted in a given election.
;; Key: A tuple containing the election ID and the voter's principal.
;; Value: A boolean (true) indicating the principal has voted.
(define-map voter-tracker { election-id: uint, voter: principal } bool)

;; A counter to generate unique IDs for new elections.
(define-data-var election-id-counter uint u0)

;; --- Public Functions ---

;; Creates a new election with the specified details.
;; @param question: The text of the election question (max 256 UTF8 chars).
;; @param start-block: The block height when voting starts (must be >= current block height).
;; @param end-block: The block height when voting ends (must be > start-block).
;; @param options: A list of voting options (strings, max 64 UTF8 chars each, max MAX_OPTIONS items).
;; @returns (ok uint) with the new election ID on success, or an error code.
(define-public (create-election (question (string-utf8 256)) (start-block uint) (end-block uint) (options (list MAX_OPTIONS (string-utf8 64))))
    (begin
        ;; Input Validations
        (asserts! (not (is-eq question "")) ERR-EMPTY-QUESTION)
        (asserts! (> (len options) u0) ERR-NO-OPTIONS) ;; Must have at least one option (realistically >= 2)
        (asserts! (<= (len options) MAX_OPTIONS) ERR-TOO-MANY-OPTIONS) ;; Check against max options limit
        (asserts! (< start-block end-block) ERR-INVALID-TIMES) ;; End must be after start
        (asserts! (>= start-block block-height) ERR-INVALID-TIMES) ;; Start cannot be in the past

        ;; Generate new ID and store election data
        (let ((new-election-id (+ (var-get election-id-counter) u1)))
            (map-insert elections new-election-id {
                id: new-election-id,
                question: question,
                creator: tx-sender, ;; The caller is the creator
                start-block: start-block,
                end-block: end-block,
                options: options,
                total-votes: u0 ;; Initialize total votes to zero
            })
            (var-set election-id-counter new-election-id) ;; Increment the global counter

            ;; Initialize vote counts for all options to 0 using a fold
            (fold init-option-count options new-election-id)

            (print { action: "create-election", id: new-election-id, creator: tx-sender }) ;; Optional event log
            (ok new-election-id) ;; Return the ID of the newly created election
        )
    )
)

;; Allows the transaction sender to cast a vote in a specified election.
;; @param election-id: The ID of the election to vote in.
;; @param option-index: The 0-based index of the chosen option in the election's options list.
;; @returns (ok bool) true on successful vote, or an error code.
(define-public (cast-vote (election-id uint) (option-index uint))
    (let (
        (voter tx-sender) ;; The voter is the transaction sender
        (election (unwrap! (map-get? elections election-id) ERR-ELECTION-NOT-FOUND)) ;; Get election data or fail
        (current-block block-height) ;; Get the current block height
    )
        ;; Pre-conditions for voting
        (asserts! (>= current-block (get start-block election)) ERR-ELECTION-NOT-STARTED) ;; Check if election has started
        (asserts! (< current-block (get end-block election)) ERR-ELECTION-ENDED) ;; Check if election has ended
        (asserts! (is-none (map-get? voter-tracker { election-id: election-id, voter: voter })) ERR-ALREADY-VOTED) ;; Check if voter already voted
        (asserts! (< option-index (len (get options election))) ERR-INVALID-OPTION) ;; Check if option index is valid

        ;; --- Record the Vote ---
        ;; Increment vote count for the chosen option
        (let ((current-count (default-to u0 (map-get? vote-counts { election-id: election-id, option-index: option-index }))))
            (map-set vote-counts { election-id: election-id, option-index: option-index } (+ current-count u1))
        )

        ;; Mark the voter as having voted in this election
        (map-set voter-tracker { election-id: election-id, voter: voter } true)

        ;; Increment the total vote count for the election
        (map-set elections election-id (merge election { total-votes: (+ (get total-votes election) u1) }))

        (print { action: "cast-vote", election-id: election-id, voter: voter, option: option-index }) ;; Optional event log
        (ok true) ;; Indicate success
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

;; --- Private Helper Functions ---

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

