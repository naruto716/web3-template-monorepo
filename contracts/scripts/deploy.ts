import { ethers } from "hardhat";
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying all contracts...");

  // Get all Solidity files in the contracts directory
  const contractsDir = path.join(__dirname, "../contracts");
  const contractFiles = fs.readdirSync(contractsDir)
    .filter(file => file.endsWith(".sol"));

  // Track deployed contract addresses
  const deployedContracts: Record<string, string> = {};
  
  // Deploy each contract
  for (const contractFile of contractFiles) {
    try {
      // Extract contract name (without .sol extension)
      const contractName = path.basename(contractFile, ".sol");
      console.log(`Deploying ${contractName} contract...`);
      
      // Get contract factory
      const ContractFactory = await ethers.getContractFactory(contractName);
      
      let contract;
      
      // Special case for Lock contract which requires constructor arguments
      if (contractName === "Lock") {
        // Set unlock time to 1 year from now (in seconds)
        const unlockTime = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
        // Deploy with unlock time and add some ETH (0.1 ETH)
        contract = await ContractFactory.deploy(unlockTime, { value: ethers.parseEther("0.1") });
      } else {
        // Deploy other contracts with no arguments
        contract = await ContractFactory.deploy();
      }
      
      await contract.waitForDeployment();
      
      // Get deployed address
      const address = await contract.getAddress();
      deployedContracts[contractName] = address;
      
      console.log(`${contractName} deployed to: ${address}`);
    } catch (error) {
      console.error(`Error deploying contract ${contractFile}:`, error);
    }
  }
  
  // Write deployment addresses to a file for reference
  const deploymentPath = path.join(__dirname, "../deployments.json");
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deployedContracts, null, 2)
  );
  console.log(`Deployment addresses saved to: ${deploymentPath}`);
  
  // Convert address mapping to JSON string for passing to scripts
  const addressesJson = JSON.stringify(deployedContracts);
  
  // Copy ABI to frontend with the contract addresses
  exec(`node scripts/copyAbiToFrontend.js '${addressesJson}'`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error copying ABI to frontend: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Copy ABI to frontend stderr: ${stderr}`);
      return;
    }
    console.log(stdout);
  });

  // Copy ABI to backend with the contract addresses
  exec(`node scripts/copyAbiToBackend.js '${addressesJson}'`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error copying ABI to backend: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Copy ABI to backend stderr: ${stderr}`);
      return;
    }
    console.log(stdout);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 