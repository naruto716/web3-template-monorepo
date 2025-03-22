const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners(); // ✅ Get deployer address

    const SkillContract = await hre.ethers.getContractFactory("SkillContract");

    // ✅ FIX: Do not pass deployer.address (no arguments needed)
    const contract = await SkillContract.deploy(); 

    console.log(`SkillContract deployed at ${await contract.getAddress()}`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
