import { ethers } from "hardhat";
import { exec } from "child_process";

async function main() {
  console.log("Deploying SimpleMarketplace contract...");

  const SimpleMarketplace = await ethers.getContractFactory("SimpleMarketplace");
  const marketplace = await SimpleMarketplace.deploy();

  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  console.log(`SimpleMarketplace deployed to: ${address}`);
  
  // Copy ABI to frontend with the new contract address
  exec(`node scripts/copyAbiToFrontend.js ${address}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error copying ABI: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Copy ABI stderr: ${stderr}`);
      return;
    }
    console.log(stdout);
  });

  // Copy ABI to backend with the new contract address
  exec(`node scripts/copyAbiToBackend.js ${address}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error copying ABI: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Copy ABI stderr: ${stderr}`);
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