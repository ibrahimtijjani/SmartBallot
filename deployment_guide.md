# Deployment Guide

This guide provides instructions for deploying the Decentralized Voting Platform, including the Clarity smart contract and the React frontend.

## 1. Deploying the Smart Contract (`voting.clar`)

The Clarity smart contract needs to be deployed to the desired Stacks network (Testnet or Mainnet).

**Prerequisites:**

*   Clarinet installed.
*   A Stacks account (principal) with sufficient STX tokens to cover deployment fees on the target network (Testnet STX can be obtained from a faucet).
*   Your account's secret key (mnemonic phrase) available securely.

**Steps using Clarinet:**

1.  **Configure Deployment Plan:**
    *   Clarinet uses deployment plan files located in `contracts/deployments/`. While Clarinet primarily uses these for its integrated Devnet, you can adapt the structure or use the Stacks CLI for more direct control over Testnet/Mainnet deployments.
    *   For Testnet/Mainnet, ensure your deployer account is configured in `contracts/settings/Testnet.toml` or `contracts/settings/Mainnet.toml` with the correct mnemonic.
        ```toml
        # Example settings/Testnet.toml
        [deployment.default]
        # Set the deployer account name configured in Clarinet.toml
        deployer = "deployer" 
        # Or specify the principal directly if needed
        # deployer = "STxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        ```

2.  **Check Contract:**
    ```bash
    cd contracts
    clarinet check
    ```

3.  **Deploy to Testnet (Example using Stacks CLI - Recommended for Testnet/Mainnet):**
    *   Install Stacks CLI: `npm install -g @stacks/cli`
    *   Ensure your secret key is available (e.g., via environment variable `STACKS_SECRET_KEY` or entered securely when prompted).
    *   Run the deployment command (adjust network and paths):
        ```bash
        stacks contract deploy \
            --contract_name voting \
            --path ./contracts/voting.clar \
            --network testnet \
            --secret_key <Your_Secret_Key_Here_Or_Use_Env_Var> \
            --fee 500000 # Adjust fee as needed
        ```
    *   **Note:** Carefully manage your secret key. Using environment variables or secure prompts is safer than pasting it directly.
    *   The command will output the transaction ID and the deployed contract address (e.g., `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.voting`).

4.  **Deploy to Mainnet:**
    *   Follow the same Stacks CLI steps as above, but change `--network testnet` to `--network mainnet`.
    *   Ensure you are using your Mainnet account and have sufficient real STX for fees.
    *   **Deploying to Mainnet is irreversible and costs real STX. Test thoroughly on Testnet first.**

5.  **Record Contract Address:** Note the fully qualified contract address (e.g., `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.voting`). You will need the principal part (`ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM`) and the contract name (`voting`) for the frontend configuration.

## 2. Deploying the Frontend (React App)

The frontend is a static React application built using Vite. It can be deployed to various static hosting platforms.

**Prerequisites:**

*   Node.js and npm installed.
*   The deployed smart contract address and name.

**Steps:**

1.  **Configure Environment Variables:**
    *   Navigate to the `frontend/` directory.
    *   Create a `.env.production` file (or configure environment variables directly in your hosting provider's settings).
    *   Set the following variables in `.env.production`:
        ```dotenv
        VITE_APP_TITLE="Decentralized Voting Platform"
        VITE_NETWORK="mainnet" # Or "testnet"
        VITE_CONTRACT_ADDRESS="STxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" # Your deployed contract principal address
        VITE_CONTRACT_NAME="voting" # Your deployed contract name
        # VITE_API_BASE_URL=... # Optional: Override default Hiro API
        ```
    *   **Crucially, replace placeholders with your actual deployed contract details and target network.**

2.  **Build the Application:**
    ```bash
    cd frontend
    npm install
    npm run build
    ```
    This command creates an optimized static build in the `frontend/dist/` directory.

3.  **Deploy to Hosting Provider:**
    *   Choose a hosting provider (e.g., Vercel, Netlify, GitHub Pages, AWS S3/CloudFront, Fleek for IPFS).
    *   Follow the provider's instructions to deploy the contents of the `frontend/dist/` directory.
    *   **Example (Vercel/Netlify):**
        *   Connect your Git repository (GitHub, GitLab, Bitbucket) to Vercel/Netlify.
        *   Configure the build settings:
            *   **Build Command:** `npm run build` or `cd frontend && npm install && npm run build` (if deploying from root)
            *   **Output Directory:** `frontend/dist` (or just `dist` if deploying from the `frontend` directory)
            *   **Install Command:** `npm install` or `cd frontend && npm install`
        *   Configure Environment Variables in the Vercel/Netlify project settings (using the values from step 1).
        *   Deploy the site.

## 3. Docker Deployment (Optional)

A Dockerfile is provided to containerize the frontend application for deployment.

**Steps:**

1.  **Build the Docker Image:**
    ```bash
    # Ensure you are in the project root directory
    docker build -t decentralized-voting-frontend -f frontend/Dockerfile .
    ```

2.  **Run the Container:**
    *   You'll need to pass the environment variables required by the frontend build process into the container at runtime or bake them into the image (less flexible).
    *   The Dockerfile uses Nginx to serve the static files. Expose the appropriate port.
    ```bash
    docker run -d -p 8080:80 \
        --env VITE_NETWORK=testnet \
        --env VITE_CONTRACT_ADDRESS=ST... \
        --env VITE_CONTRACT_NAME=voting \
        decentralized-voting-frontend
    ```
    *   Access the application at `http://localhost:8080`.

*(Note: The Dockerfile needs to be created first)*
