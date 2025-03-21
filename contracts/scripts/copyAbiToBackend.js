const fs = require('fs');
const path = require('path');

// Get contract address from command line if provided
const contractAddress = process.argv[2] || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Define paths
const sourceAbiPath = path.join(__dirname, '../artifacts/contracts/SimpleMarketplace.sol/SimpleMarketplace.json');
const targetDir = path.join(__dirname, '../../backend/src/abis');
const targetPath = path.join(targetDir, 'marketplace.json');

// Ensure the target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created directory: ${targetDir}`);
}

try {
  // Read the ABI
  const contractArtifact = JSON.parse(fs.readFileSync(sourceAbiPath, 'utf8'));
  const abi = contractArtifact.abi;

  // Create the output object with ABI and address
  const output = {
    abi: abi,
    address: contractAddress
  };

  // Write to the backend
  fs.writeFileSync(targetPath, JSON.stringify(output, null, 2));
  console.log(`ABI copied to backend: ${targetPath}`);
} catch (error) {
  console.error('Error copying ABI to backend:', error);
}