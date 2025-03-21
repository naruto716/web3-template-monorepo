const fs = require('fs');
const path = require('path');

// Get addresses - either from command line as JSON string or use default
let contractAddresses = {};
try {
  // Try to parse the first argument as JSON
  if (process.argv[2]) {
    contractAddresses = JSON.parse(process.argv[2]);
  }
} catch (error) {
  console.error('Error parsing contract addresses. Using default address.');
}

// Default address as fallback
const DEFAULT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Define paths
const artifactsDir = path.join(__dirname, '../artifacts/contracts');
const targetDir = path.join(__dirname, '../../frontend/src/services/web3/contracts');

// Ensure the target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created directory: ${targetDir}`);
}

// Function to find all JSON files in artifacts recursively
function findJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fileList = findJsonFiles(filePath, fileList);
    } else if (file.endsWith('.json') && !file.endsWith('.dbg.json')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Get all JSON files
const jsonFiles = findJsonFiles(artifactsDir);

// Copy each contract ABI
let copiedCount = 0;
jsonFiles.forEach(jsonFile => {
  try {
    // Read contract artifact
    const contractArtifact = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    
    // Skip if no ABI
    if (!contractArtifact.abi) return;
    
    // Get contract name from the file path
    const contractName = path.basename(jsonFile, '.json');
    const contractKey = contractName.split('.')[0]; // Extract base name without potential extensions
    
    // Get the address for this specific contract or use default
    const address = contractAddresses[contractKey] || DEFAULT_ADDRESS;
    
    // Create output file path
    const outputPath = path.join(targetDir, `${contractName}.json`);
    
    // Write ABI and address to file
    fs.writeFileSync(
      outputPath,
      JSON.stringify({
        abi: contractArtifact.abi,
        address: address
      }, null, 2)
    );
    
    copiedCount++;
    console.log(`ABI copied to frontend: ${outputPath} with address ${address}`);
  } catch (error) {
    console.error(`Error copying ABI from ${jsonFile}:`, error);
  }
});

console.log(`Successfully copied ${copiedCount} contract ABIs to frontend`); 