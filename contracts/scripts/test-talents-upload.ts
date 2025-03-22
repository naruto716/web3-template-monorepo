import { ethers } from "hardhat";
import { Talents } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

// Mock data structure matching your MongoDB schema
interface TalentData {
    name: string;
    wallet_address: string;
    profile_id: string;
}

// Temporary mock data - Replace this with actual data export from your MongoDB
const MOCK_TALENTS: TalentData[] = [
    {
        name: "Test Freelancer",
        wallet_address: "0xYourWalletAddress",
        profile_id: "test-profile-123"
    }
    // Add more test data as needed
];

async function fetchTalentsFromService(): Promise<TalentData[]> {
    // TODO: Replace this with actual data from your MongoDB export
    return MOCK_TALENTS;
}

async function main() {
    console.log("Starting talent upload to blockchain...");

    const TALENTS_ADDRESS = "0x370DbaE6140b04811385D30c5aDBE80e63f06d65";

    const [signer]: HardhatEthersSigner[] = await ethers.getSigners();
    console.log("Using account:", signer.address);

    try {
        const talents: Talents = await ethers.getContractAt("Talents", TALENTS_ADDRESS);

        // Fetch talents using your service
        console.log("\nFetching talents from service...");
        const serviceTalents = await fetchTalentsFromService();
        console.log(`Found ${serviceTalents.length} talents to upload`);

        let successCount = 0;
        let failCount = 0;

        for (const talent of serviceTalents) {
            try {
                console.log(`\nProcessing talent: ${talent.name}`);
                
                // Check if talent exists on chain
                try {
                    const existingTalent = await talents.getFreelancer(talent.wallet_address);
                    if (existingTalent[0] !== "") {
                        console.log(`⚠️ Talent already exists for ${talent.wallet_address}, skipping...`);
                        continue;
                    }
                } catch (error) {
                    // If error, talent doesn't exist, proceed with creation
                }

                // Create freelancer profile
                const createTx = await talents.createFreelancer(
                    talent.name,
                    talent.profile_id
                );
                
                const receipt = await createTx.wait();
                
                console.log(`✅ Talent uploaded successfully!`);
                console.log(`   Transaction Hash: ${receipt?.hash}`);
                console.log(`   Name: ${talent.name}`);
                console.log(`   Profile ID: ${talent.profile_id}`);
                console.log(`   Wallet: ${talent.wallet_address}`);
                
                successCount++;
                
                // Add delay between transactions
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`❌ Error uploading talent ${talent.name}:`, error);
                failCount++;
                continue;
            }
        }

        // Final summary
        console.log("\n----------------------------------------");
        console.log("Upload Summary:");
        console.log(`Total Talents: ${serviceTalents.length}`);
        console.log(`Successfully Uploaded: ${successCount}`);
        console.log(`Failed: ${failCount}`);
        console.log("----------------------------------------");

        console.log("\n✅ Talent upload process completed!");
        
    } catch (error) {
        console.error("❌ Script failed:", error);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
