import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying with:", deployer.address);

  const deploymentsPath = path.join(__dirname, "../../deployments.json");
  const deployments = fs.existsSync(deploymentsPath)
    ? JSON.parse(fs.readFileSync(deploymentsPath, "utf8"))
    : {};

  // Deploy SkillNFT_And_Escrow
  const SkillFactory = await ethers.getContractFactory("SkillNFT_And_Escrow");
  const skillContract = await SkillFactory.deploy();
  await skillContract.waitForDeployment();
  const skillAddress = await skillContract.getAddress();
  deployments["SkillNFT_And_Escrow"] = skillAddress;
  console.log(`✅ SkillNFT_And_Escrow deployed at: ${skillAddress}`);

  // Deploy Talents
  const TalentsFactory = await ethers.getContractFactory("Talents");
  const talents = await TalentsFactory.deploy();
  await talents.waitForDeployment();
  const talentsAddress = await talents.getAddress();
  deployments["Talents"] = talentsAddress;
  console.log(`✅ Talents deployed at: ${talentsAddress}`);

  // Save to deployments.json
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log("📦 Deployments saved to deployments.json");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
