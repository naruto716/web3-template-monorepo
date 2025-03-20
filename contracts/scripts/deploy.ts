import { ethers } from "hardhat";

async function main() {
  console.log("Deploying SimpleMarketplace contract...");

  const SimpleMarketplace = await ethers.getContractFactory("SimpleMarketplace");
  const marketplace = await SimpleMarketplace.deploy();

  await marketplace.waitForDeployment();

  console.log(`SimpleMarketplace deployed to: ${await marketplace.getAddress()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 