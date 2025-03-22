import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying contract with account:", deployer.address);

  const ContractFactory = await ethers.getContractFactory("SkillNFT_And_Escrow");
  const contract = await ContractFactory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ SkillNFT_And_Escrow deployed at:", address);

  // Save address to JSON for frontend/backend use
  const deploymentsPath = path.join(__dirname, "../../deployments.json");
  const deployments = fs.existsSync(deploymentsPath)
    ? JSON.parse(fs.readFileSync(deploymentsPath, "utf8"))
    : {};

  deployments["SkillNFT_And_Escrow"] = address;
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log("📦 Saved deployment address to deployments.json");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
