# Contributing to the Decentralized Voting Platform

First off, thank you for considering contributing! Your help is appreciated. Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open-source project.

## Code of Conduct

This project and everyone participating in it is governed by a [Code of Conduct](CODE_OF_CONDUCT.md) (to be added). By participating, you are expected to uphold this code. Please report unacceptable behavior.

## How Can I Contribute?

Contributions are welcome in various forms:

*   **Reporting Bugs:** If you find a bug, please open an issue detailing how to reproduce it.
*   **Suggesting Enhancements:** Open an issue to suggest new features or improvements to existing functionality.
*   **Pull Requests:** Submit pull requests to fix bugs, add features, or improve documentation.

## Pull Request Process

1.  **Fork the repository** and create your branch from `main` (or the relevant development branch).
2.  **Ensure dependencies are installed:** Follow the setup instructions in `installation_setup.md`.
3.  **Make your changes:** Adhere to the coding style and add comments where necessary.
4.  **Add tests:** If you add functionality, please add corresponding tests (contract tests using Clarinet, frontend tests using Jest/React Testing Library - *testing setup pending*).
5.  **Ensure tests pass:** Run `clarinet test` for contracts and `npm test` (once configured) for the frontend.
6.  **Update documentation:** If your changes affect documentation (README, API docs, etc.), please update it accordingly.
7.  **Submit the Pull Request:** Ensure the PR description clearly describes the changes and links to any relevant issues.

## Development Setup

Refer to the [installation_setup.md](./installation_setup.md) guide for instructions on setting up your local development environment.

## Style Guides

*   **Clarity:** Follow standard Clarity best practices.
*   **TypeScript/React:** Adhere to common React/TypeScript patterns. Use Prettier/ESLint (configuration pending) for code formatting.
*   **Git Commit Messages:** Use conventional commit messages (e.g., `feat: Add user profile page`, `fix: Correct vote counting logic`).

Thank you for contributing!
