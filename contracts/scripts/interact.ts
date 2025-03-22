import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer, company] = await ethers.getSigners();
  console.log("👤 Using deployer (freelancer):", deployer.address);
  console.log("👤 Using company:", company.address);

  // Load contract
  const deploymentsPath = path.join(__dirname, "../../deployments.json");
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const contractAddress = deployments["SkillNFT_And_Escrow"];
  const SkillNFT = await ethers.getContractAt("SkillNFT_And_Escrow", contractAddress);

  // Test 1: Create Offer NFT
  console.log("\n1️⃣ Testing createOfferNFT...");
  const tx1 = await SkillNFT.createOfferNFT(
    company.address,
    "Smart Contract Development",
    ethers.parseEther("1.5"),
    Math.floor(Date.now() / 1000) + 3600,
    Math.floor(Date.now() / 1000) + (7 * 24 * 3600)
  );
  const receipt1 = await tx1.wait();
  const tokenId = receipt1.logs.find(
    (log: any) => log.fragment?.name === "OfferNFTCreated"
  )?.args?.[0];
  console.log("✅ NFT created with ID:", tokenId.toString());

  // Test 2: Get Offer Details
  console.log("\n2️⃣ Testing getOffer...");
  const offer = await SkillNFT.getOffer(tokenId);
  console.log("📄 Offer details:", {
    freelancer: offer.freelancer,
    company: offer.company,
    skillName: offer.skillName,
    payment: ethers.formatEther(offer.payment),
    startDate: new Date(Number(offer.startDate) * 1000).toLocaleString(),
    endDate: new Date(Number(offer.endDate) * 1000).toLocaleString()
  });

  // Test 3: Trade Offer NFT
  console.log("\n3️⃣ Testing tradeOfferNFT...");
  const tx2 = await SkillNFT.connect(company).tradeOfferNFT(tokenId, {
    value: ethers.parseEther("1.5")
  });
  await tx2.wait();
  console.log("✅ Trade completed");

  // Test 4: Early Payment Release (should fail)
  console.log("\n4️⃣ Testing early releasePayment...");
  try {
    await SkillNFT.releasePayment(tokenId);
  } catch (error: any) {
    console.log("✅ Early release failed as expected:", error.message);
  }

  // Test 5: Time Travel (local only)
  console.log("\n5️⃣ Simulating time passage...");
  await ethers.provider.send("evm_increaseTime", [7 * 24 * 3600 + 3600]);
  await ethers.provider.send("evm_mine", []);

  // Test 6: Release Payment
  console.log("\n6️⃣ Testing releasePayment...");
  const balanceBefore = await ethers.provider.getBalance(deployer.address);
  const tx3 = await SkillNFT.releasePayment(tokenId);
  await tx3.wait();
  const balanceAfter = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Payment received:", 
    ethers.formatEther(balanceAfter - balanceBefore), "ETH"
  );

  console.log("\n✨ All tests completed!");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});
