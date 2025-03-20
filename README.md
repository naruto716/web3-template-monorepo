# Web3 Template

A comprehensive template for building Web3 applications with a clear separation of concerns between on-chain and off-chain components.

## 🏗️ Architecture

This template uses a three-part architecture:

1. **Smart Contracts** (On-Chain): Solidity contracts deployed on Ethereum/EVM chains
2. **Backend** (Off-Chain): Node.js server for off-chain logic and indexing
3. **Frontend**: React application with Web3 integration

## 🚀 Technology Stack

### Smart Contracts
- Solidity
- Hardhat
- TypeScript

### Backend
- Node.js
- Express
- TypeScript

### Frontend
- React
- Redux Toolkit
- TypeScript
- Tailwind CSS
- ShadCN UI Components
- ethers.js v6

## 🤔 Design Decisions: On-Chain vs. Off-Chain

One of the most critical decisions in Web3 development is determining what logic belongs on-chain (in smart contracts) versus off-chain (in your backend server).

### When to Use Smart Contracts (On-Chain)

Use smart contracts for:

1. **Core Financial Logic**
   - Asset transfers, token minting, swaps
   - Escrow mechanisms and payment processing

2. **Critical Trust Mechanisms**
   - Ownership records (NFTs, property titles)
   - Permanent record-keeping that requires immutability

3. **Decentralized Business Rules**
   - Automatic royalty distributions
   - Protocol rules that cannot be circumvented

4. **State That Requires Consensus**
   - Official balances and ownership records
   - State that multiple parties must agree on

### When to Use Node.js Backend (Off-Chain)

Use Node.js for:

1. **User Experience Features**
   - User profiles and preferences
   - Notifications and alerts

2. **Complex Computations**
   - AI/ML processing
   - Complex searches and filtering

3. **Data Management**
   - Storing large datasets (blockchain storage is expensive)
   - Indexing blockchain events for fast retrieval
   - Managing metadata (e.g., NFT images, descriptions)

4. **Integration Points**
   - APIs to external services
   - Email and notification services

5. **Privacy Concerns**
   - Storage of private user data (with proper encryption)

## 🔍 Sample Application: Marketplace

This template includes a simple digital marketplace where:

- **Smart Contract**: Handles listings, sales, ownership, and fees
- **Backend**: Manages search, indexing, user profiles, and metadata
- **Frontend**: Provides the UI, handles wallet connection, and displays items

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 16+
- MetaMask or another Web3 wallet
- Sepolia Testnet ETH (for testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/web3-template.git
cd web3-template
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# In contracts/.env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY

# In backend/.env (coming soon)
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Compile and Deploy Contracts

```bash
# Compile contracts
npm run contracts:compile

# Deploy to Sepolia testnet
npm run contracts:deploy:sepolia
```

### Start Development Servers

```bash
# Start frontend
npm run frontend:dev

# Start backend (coming soon)
npm run backend:dev
```

## 📁 Project Structure

```
web3-template/
├── contracts/     - Solidity smart contracts (Hardhat project)
│   ├── contracts/ - Contract source files
│   ├── scripts/   - Deployment scripts
│   └── test/      - Contract tests
├── backend/       - Node.js server (Express API) - coming soon
├── frontend/      - React frontend (TypeScript, Redux, TailwindCSS)
│   ├── src/
│   │   ├── app/           - Application core (store, hooks, router)
│   │   ├── components/    - Reusable UI components
│   │   ├── features/      - Feature-based code organization
│   │   ├── pages/         - Page components
│   │   └── services/      - External service integrations
└── ...
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Hardhat](https://hardhat.org/)
- [ethers.js](https://docs.ethers.org/v6/)
- [React](https://reactjs.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ShadCN UI](https://ui.shadcn.com/) 