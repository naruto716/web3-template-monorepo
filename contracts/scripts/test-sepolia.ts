import { ethers } from "hardhat";
import { SkillNFT_And_Escrow, Talents } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

async function main() {
  console.log("Starting Sepolia network tests...");

  // Get the deployed contract addresses
  const TALENTS_ADDRESS = "0x370DbaE6140b04811385D30c5aDBE80e63f06d65";
  const SKILLNFT_ADDRESS = "0xc8Ac71f2B3c3D8cc31004694ced6D960C860f7f3";

  // Get the signer
  const [signer]: HardhatEthersSigner[] = await ethers.getSigners();
  console.log("Testing with account:", signer.address);

  try {
    // Get contract instances with proper typing
    const talents: Talents = await ethers.getContractAt("Talents", TALENTS_ADDRESS);
    const skillNFT: SkillNFT_And_Escrow = await ethers.getContractAt("SkillNFT_And_Escrow", SKILLNFT_ADDRESS);

    // Test Talents Contract
    console.log("\nTesting Talents Contract...");
    
    // Create a freelancer profile
    console.log("Creating freelancer profile...");
    const createTx = await talents.createFreelancer("Test Freelancer", "test-profile-123");
    await createTx.wait();
    console.log("✅ Freelancer profile created");

    // Get freelancer info
    console.log("Getting freelancer info...");
    const freelancerInfo = await talents.getFreelancer(signer.address);
    console.log("✅ Freelancer info retrieved:");
    console.log("   Name:", freelancerInfo[0]);
    console.log("   Wallet:", freelancerInfo[1]);
    console.log("   Profile ID:", freelancerInfo[2]);

    // Test SkillNFT Contract
    console.log("\nTesting SkillNFT Contract...");
    
    // Create an offer
    console.log("Creating offer...");
    const payment = ethers.parseEther("0.1"); // 0.1 ETH
    const startDate = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const endDate = startDate + 86400; // 24 hours from start
    
    const createOfferTx = await skillNFT.createOfferNFT(
      signer.address, // company address (using same address for testing)
      "Web Development",
      payment,
      startDate,
      endDate
    );
    const offerReceipt = await createOfferTx.wait();
    console.log("✅ Offer created");

    // Get the token ID from the event
    if (!offerReceipt) throw new Error("Transaction receipt not found");
    
    const offerEvent = offerReceipt.logs.find(
      log => log.topics[0] === skillNFT.interface.getEventTopic("OfferNFTCreated")
    );
    
    if (!offerEvent) throw new Error("OfferNFTCreated event not found");
    
    const parsedEvent = skillNFT.interface.parseLog({
      topics: offerEvent.topics,
      data: offerEvent.data
    });
    
    if (!parsedEvent) throw new Error("Could not parse event");
    
    const tokenId = parsedEvent.args[0];
    console.log("Token ID:", tokenId.toString());

    // Get offer details
    console.log("Getting offer details...");
    const offer = await skillNFT.getOffer(tokenId);
    console.log("✅ Offer details retrieved:");
    console.log("   Freelancer:", offer.freelancer);
    console.log("   Company:", offer.company);
    console.log("   Skill Name:", offer.skillName);
    console.log("   Payment:", ethers.formatEther(offer.payment), "ETH");
    console.log("   Start Date:", new Date(Number(offer.startDate) * 1000).toLocaleString());
    console.log("   End Date:", new Date(Number(offer.endDate) * 1000).toLocaleString());
    console.log("   Is Traded:", offer.isTraded);
    console.log("   Is Paid:", offer.isPaid);

    console.log("\n✅ All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error; // Re-throw to trigger process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });