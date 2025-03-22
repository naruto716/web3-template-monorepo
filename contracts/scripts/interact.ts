import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer, company] = await ethers.getSigners();
  console.log("👤 Using deployer (freelancer):", deployer.address);
  console.log("👤 Using company:", company.address);

  // 📂 Load contract address
  const deploymentsPath = path.join(__dirname, "../../deployments.json");
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const contractAddress = deployments["SkillNFT_And_Escrow"];

  // 🧠 Get contract instance
  const SkillNFT = await ethers.getContractAt("SkillNFT_And_Escrow", contractAddress);

  // 1️⃣ Create Offer NFT (as freelancer)
  console.log("\n📝 Creating offer NFT...");
  const skillName = "Smart Contract Development";
  const payment = ethers.parseEther("1.5"); // 1.5 ETH
  const startDate = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  const endDate = startDate + (7 * 24 * 3600); // 7 days after start

  const tx1 = await SkillNFT.createOfferNFT(
    company.address,
    skillName,
    payment,
    startDate,
    endDate
  );
  const receipt1 = await tx1.wait();
  
  // Get tokenId from event
  const event = receipt1.logs.find(
    (log: any) => log.fragment?.name === "OfferNFTCreated"
  );
  const tokenId = event?.args?.[0];
  
  console.log("✅ Offer NFT created with ID:", tokenId.toString());

  // 2️⃣ View offer details
  console.log("\n📄 Reading offer details...");
  const offer = await SkillNFT.getOffer(tokenId);
  console.log({
    freelancer: offer.freelancer,
    company: offer.company,
    skillName: offer.skillName,
    payment: ethers.formatEther(offer.payment),
    offerId: offer.offerId.toString(),
    startDate: new Date(Number(offer.startDate) * 1000).toLocaleString(),
    endDate: new Date(Number(offer.endDate) * 1000).toLocaleString(),
    isTraded: offer.isTraded,
    isPaid: offer.isPaid
  });

  // 3️⃣ Trade NFT (as company)
  console.log("\n💰 Company trading ETH for NFT...");
  const tx2 = await SkillNFT.connect(company).tradeOfferNFT(tokenId, {
    value: payment
  });
  await tx2.wait();
  console.log("✅ Trade completed");

  // 4️⃣ Try to release payment (should fail as end date not reached)
  console.log("\n⏳ Attempting early payment release...");
  try {
    await SkillNFT.releasePayment(tokenId);
  } catch (error: any) {
    console.log("❌ Early release failed as expected:", error.message);
  }

  // 5️⃣ Simulate time passing to end date (only works on hardhat network)
  console.log("\n⏰ Simulating time passage...");
  await ethers.provider.send("evm_increaseTime", [7 * 24 * 3600 + 3600]);
  await ethers.provider.send("evm_mine", []);

  // 6️⃣ Release payment (should succeed now)
  console.log("\n💸 Releasing payment...");
  const balanceBefore = await ethers.provider.getBalance(deployer.address);
  
  const tx3 = await SkillNFT.releasePayment(tokenId);
  await tx3.wait();
  
  const balanceAfter = await ethers.provider.getBalance(deployer.address);
  const receivedPayment = balanceAfter - balanceBefore;
  
  console.log("✅ Payment released");
  console.log("💰 Received payment:", ethers.formatEther(receivedPayment), "ETH");

  // 7️⃣ Verify final offer state
  console.log("\n📄 Final offer state:");
  const finalOffer = await SkillNFT.getOffer(tokenId);
  console.log({
    isTraded: finalOffer.isTraded,
    isPaid: finalOffer.isPaid
  });
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});
