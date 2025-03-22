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

## Deployed Contracts (Sepolia)

The following contracts are deployed on Sepolia testnet:

- **Talents Contract**: [`0x370DbaE6140b04811385D30c5aDBE80e63f06d65`](https://sepolia.etherscan.io/address/0x370DbaE6140b04811385D30c5aDBE80e63f06d65)
- **SkillNFT_And_Escrow Contract**: [`0xc8Ac71f2B3c3D8cc31004694ced6D960C860f7f3`](https://sepolia.etherscan.io/address/0xc8Ac71f2B3c3D8cc31004694ced6D960C860f7f3)
