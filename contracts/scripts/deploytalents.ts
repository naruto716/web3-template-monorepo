import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("📦 Deploying Talents...");

  const TalentsFactory = await ethers.getContractFactory("Talents");

  const talents = await TalentsFactory.deploy();
  await talents.waitForDeployment();

  const address = await talents.getAddress();
  console.log(`✅ Talents deployed to: ${address}`);


  const deploymentPath = path.join(__dirname, "../deployments.json");
  fs.writeFileSync(deploymentPath, JSON.stringify({ Talents: address }, null, 2));
  console.log(`📁 Deployment address saved to: ${deploymentPath}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
