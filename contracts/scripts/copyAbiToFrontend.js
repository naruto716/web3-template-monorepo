const fs = require('fs');
const path = require('path');

// Get contract address from command line arguments
const contractAddress = process.argv[2];

// Paths
const sourcePath = path.join(__dirname, '../artifacts/contracts/SimpleMarketplace.sol/SimpleMarketplace.json');
const targetDir = path.join(__dirname, '../../frontend/src/services/web3/contracts');
const targetPath = path.join(targetDir, 'SimpleMarketplace.json');

// Make sure the target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created directory: ${targetDir}`);
}

// Read and extract the ABI
try {
  const contractArtifact = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const abi = contractArtifact.abi;

  // If we have a contract address from deployment, use it, otherwise use a placeholder
  const address = contractAddress || '0x0000000000000000000000000000000000000000';

  // Write the ABI to the frontend
  fs.writeFileSync(
    targetPath,
    JSON.stringify({ abi, address }, null, 2)
  );

  console.log(`Successfully copied ABI to: ${targetPath}`);
  if (contractAddress) {
    console.log(`Updated contract address to: ${contractAddress}`);
  }
} catch (error) {
  console.error('Error copying ABI:', error.message);
  process.exit(1);
} 