import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("👤 Using deployer:", deployer.address);

  // 📂 Load Talents contract address
  const deploymentsPath = path.join(__dirname, "../../deployments.json");
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const talentsAddress = deployments["Talents"];

  // 🧠 Get contract instance
  const Talents = await ethers.getContractAt("Talents", talentsAddress);

  // 1️⃣ Create Freelancer on chain
  const name = "Tonny Chen";
  const profileId = "tonny123";

  const tx1 = await Talents.createFreelancer(name, profileId);
  await tx1.wait();
  console.log("✅ Freelancer profile created");

  // Add a small delay to ensure transaction is mined
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 2️⃣ Read Freelancer data from chain
  const [storedName, storedWallet, storedProfileId] = await Talents.getFreelancer(deployer.address);
  console.log("📄 On-chain profile:", { storedName, storedWallet, storedProfileId });
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});
