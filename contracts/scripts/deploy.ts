import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment to Sepolia...");

  // Deploy Talents contract first
  const Talents = await ethers.getContractFactory("Talents");
  const talents = await Talents.deploy();
  await talents.waitForDeployment();
  const talentsAddress = await talents.getAddress();
  console.log("Talents contract deployed to:", talentsAddress);

  // Deploy SkillNFT_And_Escrow contract
  const SkillNFT = await ethers.getContractFactory("SkillNFT_And_Escrow");
  const skillNFT = await SkillNFT.deploy();
  await skillNFT.waitForDeployment();
  const skillNFTAddress = await skillNFT.getAddress();
  console.log("SkillNFT_And_Escrow contract deployed to:", skillNFTAddress);

  console.log("\nDeployment completed successfully!");
  console.log("----------------------------------------");
  console.log("Contract Addresses:");
  console.log("Talents:", talentsAddress);
  console.log("SkillNFT_And_Escrow:", skillNFTAddress);
  console.log("----------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
