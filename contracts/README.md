# Smart Contract - SimpleMarketplace

A simple marketplace smart contract for a Web3 template.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with:
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=YOUR_PRIVATE_KEY
```

## Commands

Compile:
```bash
npx hardhat compile
```

Run tests:
```bash
npx hardhat test
```

Deploy to local:
```bash
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
```

Deploy to Sepolia:
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```
