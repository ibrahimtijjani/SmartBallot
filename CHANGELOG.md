# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

*   Initial project structure setup.
*   Clarity smart contract (`voting.clar`) for core election logic (creation, voting, tallying).
*   React frontend application setup using Vite and TypeScript.
*   Tailwind CSS for styling.
*   Stacks wallet integration using `@stacks/connect` (`AuthContext`).
*   Basic routing using `react-router-dom`.
*   Core frontend components: Navbar, ConnectWalletButton.
*   Frontend pages: HomePage (placeholder), CreateElectionPage (form logic), ElectionDetailsPage (data fetching and voting logic), NotFoundPage.
*   `useVotingContract` hook for interacting with the smart contract.
*   Initial documentation: `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `project_overview.md`, `technical_requirements.md`, `directory_structure.md`, `installation_setup.md`.

### Changed

*   Installed Tailwind CSS v3 due to compatibility issues with v4 in the environment.

### Fixed

*   Resolved Tailwind CSS initialization errors.

## [0.1.0] - Q1 - 2025

*   Initial release (Placeholder for future tagged release).

[Unreleased]: https://github.com/<ibrahimtijjani>/decentralized-voting-platform/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/<ibrahimtijjani>/decentralized-voting-platform/releases/tag/v0.1.0

