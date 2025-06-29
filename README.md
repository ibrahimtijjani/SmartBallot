# Enhanced Decentralized Voting Platform (Stacks)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) <!-- Placeholder License Badge -->

A secure and transparent voting platform built on the Stacks blockchain, featuring enhanced Clarity smart contracts with advanced voting mechanisms and a React frontend for user interaction.

## Project Overview

This platform enables organizations, communities, or groups to create, manage, and participate in sophisticated voting events (elections, polls) where results are recorded immutably on the Stacks blockchain. It provides enhanced security, transparency, and verifiability with support for multiple voting types including token-gated, weighted, and privacy-preserving commit-reveal voting.

For a more detailed overview, see [project_overview.md](./project_overview.md).

## Enhanced Features

### Core Features
*   **Decentralized:** Core logic resides in Stacks smart contracts.
*   **Secure:** Leverages Clarity language features and blockchain immutability.
*   **Transparent:** Election details and vote counts are publicly verifiable on-chain.
*   **User-Friendly:** Web interface for wallet connection, election creation, viewing, and voting.
*   **Wallet Integration:** Uses `@stacks/connect` for seamless interaction with Stacks wallets (Hiro, Xverse, etc.).

### Advanced Voting Types
*   **Standard Voting:** Traditional one-person-one-vote elections
*   **Token-Gated Voting:** Restrict voting rights to holders of specific tokens
*   **Weighted Voting:** Vote weight based on token holdings for proportional representation
*   **Commit-Reveal Voting:** Two-phase voting for enhanced privacy and preventing vote manipulation

### Enhanced Security & Governance
*   **Allowlist Management:** Election creators can specify eligible voters
*   **Comprehensive Event Emission:** Full audit trail for off-chain indexing
*   **Formal Verification:** Property-based testing ensures contract correctness
*   **Gas Optimization:** Efficient batch operations and optimized vote counting

## Technical Stack

*   **Blockchain:** Stacks
*   **Smart Contract:** Clarity
*   **Frontend:** React, TypeScript, Vite, Tailwind CSS
*   **Stacks Interaction:** `@stacks/connect`, `@stacks/transactions`, `@stacks/network`
*   **Development/Testing:** Clarinet (Contracts), Jest/React Testing Library (Frontend - *to be added*)

For full details, see [technical_requirements.md](./technical_requirements.md).

## Directory Structure

The project is organized into two main parts: `contracts/` for the Clarity smart contract and `frontend/` for the React application.

```
/decentralized-voting-platform
├── contracts/         # Stacks Smart Contract (Clarinet Project)
├── frontend/          # React Frontend Application
├── .github/           # CI/CD Workflows (Example)
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE            # (To be added)
├── README.md          # This file
├── directory_structure.md
├── installation_setup.md
├── project_overview.md
└── technical_requirements.md
```

For a detailed breakdown, see [directory_structure.md](./directory_structure.md).

## Getting Started

### Prerequisites

*   Git
*   Node.js (LTS version)
*   npm
*   Clarinet
*   Stacks Wallet (Browser Extension)

### Installation and Setup

Detailed step-by-step instructions for cloning, installing dependencies, setting up environment variables, and running the project locally (both contract and frontend) are available in:

**[./installation_setup.md](./installation_setup.md)**

**Quick Start:**

1.  **Clone:** `git clone <repository-url>`
2.  **Contracts:** `cd contracts && clarinet check && clarinet test`
3.  **Frontend:** `cd ../frontend && cp .env.example .env && npm install && npm run dev`
    *   *(Remember to update `.env` with your contract details if deploying)*

## Usage

### Basic Usage
1.  **Connect Wallet:** Open the frontend application in your browser (usually `http://localhost:5173` after `npm run dev`) and connect your Stacks wallet.
2.  **Create Election:** Navigate to the "Create Election" page, fill in the details (question, options, start/end blocks), and submit the transaction via your wallet.
3.  **View Elections:** The homepage will list available elections (implementation pending).
4.  **Vote:** Navigate to an active election's details page, select an option, and submit the vote transaction via your wallet.
5.  **View Results:** Election results will be displayed on the details page, typically after the election has ended.

### Enhanced Voting Types

#### Standard Voting
Traditional one-person-one-vote elections where each participant gets equal voting power.

#### Token-Gated Voting
Restrict voting rights to holders of specific tokens:
- Set minimum token balance requirements
- Only token holders can participate
- Useful for DAO governance and token-holder decisions

#### Weighted Voting
Vote weight is proportional to token holdings:
- Larger token holders have more voting power
- Maintains proportional representation
- Ideal for stake-based governance systems

#### Commit-Reveal Voting
Two-phase voting for enhanced privacy:
1. **Commit Phase:** Voters submit encrypted vote commitments
2. **Reveal Phase:** Voters reveal their actual votes with proof
- Prevents vote manipulation and strategic voting
- Ensures vote privacy until reveal phase

### Allowlist Management
Election creators can manage voter eligibility:
- Add individual voters to allowlist
- Bulk add multiple voters
- Remove voters from allowlist
- Combine with token-gating for hybrid eligibility

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a history of changes to the project.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details (to be added).

## Future Improvements

See the [Extra Section](#9-extra) in the original request or potential future roadmap document (to be added).




## Testing

This project includes comprehensive tests for both the smart contract and the frontend application, with formal verification and gas optimization testing.

### Smart Contract Tests (Clarinet)

The Clarity smart contract tests are located in the `contracts/tests/` directory and use the Clarinet testing framework.

**Test Suites:**
- `voting_test.ts` - Core functionality and enhanced features testing
- `voting_formal_verification_test.ts` - Property-based and formal verification tests
- `voting_gas_optimization_test.ts` - Performance and gas efficiency tests

**To run the contract tests:**

1.  Navigate to the `contracts` directory:
    ```bash
    cd contracts
    ```
2.  Run the Clarinet test command:
    ```bash
    clarinet test
    ```

This command will execute all test files (`*_test.ts`) within the `contracts/tests/` directory against a simulated Clarinet development environment.

**Test Coverage:**
- ✅ Standard voting functionality
- ✅ Token-gated and weighted voting
- ✅ Commit-reveal voting workflow
- ✅ Allowlist management
- ✅ Error handling and edge cases
- ✅ Property-based verification (monotonic counters, vote consistency)
- ✅ Gas optimization and batch operations
- ✅ Timing constraint enforcement

### Frontend Tests (Jest + React Testing Library)

The frontend tests are located in the `frontend/src/__tests__/` directory and use Jest along with React Testing Library.

**To run the frontend tests:**

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Run the npm test script:
    ```bash
    npm test
    ```
    Alternatively, you can run Jest in watch mode during development:
    ```bash
    npm test -- --watch
    ```

This command executes Jest, which will find and run all test files (typically `*.test.ts` or `*.test.tsx`) within the `src` directory.

## Sample Data / Initial Elections

To populate the platform with initial sample elections for testing or demonstration purposes, you can use the Clarinet console or interact via the frontend after deploying the contract locally or to a testnet.

**Using Clarinet Console:**

1.  Navigate to the `contracts` directory: `cd contracts`
2.  Start the Clarinet console: `clarinet console`
3.  Inside the console, you can manually call the `create-election` function. Replace placeholders with desired values:
    ```clarity
    ;; Example call within Clarinet console
    (contract-call? .voting create-election
        u"Which color is best?"
        u10 ;; Start block (adjust relative to current console block height)
        u110 ;; End block
        (list u"Red" u"Green" u"Blue")
    )
    ```
    *Note: Ensure the start block is in the future relative to the console's current block height.*
