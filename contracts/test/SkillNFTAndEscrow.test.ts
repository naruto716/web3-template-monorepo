import { ethers } from "hardhat";
import { expect } from "chai";

describe("SkillNFT_And_Escrow", () => {
  let contract: any;
  let deployer: any;
  let company: any;
  let freelancer: any;

  beforeEach(async () => {
    [deployer, company, freelancer] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("SkillNFT_And_Escrow", deployer);
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  it("Should create agreement and mint NFT", async () => {
    const now = Math.floor(Date.now() / 1000);
    const end = now + 30 * 24 * 60 * 60; // 30 days later

    const tx = await contract.connect(company).createAgreement(
      freelancer.address,
      "Solidity Dev",
      now,
      end,
      "ipfs://metadata_uri",
      { value: ethers.parseEther("1.0") }
    );

    await tx.wait();

    const ag = await contract.agreements(1);
    expect(ag.freelancer).to.equal(freelancer.address);
    expect(ag.skill).to.equal("Solidity Dev");
    expect(await contract.ownerOf(1)).to.equal(company.address);

    console.log("✅ Agreement and NFT successfully created");
  });

  it("Should release payment after 30 days and deactivate", async () => {
    const now = Math.floor(Date.now() / 1000);
    const end = now + 30 * 24 * 60 * 60;

    await contract.connect(company).createAgreement(
      freelancer.address,
      "Frontend Dev",
      now,
      end,
      "ipfs://frontend_metadata",
      { value: ethers.parseEther("1.0") }
    );

    // Fast-forward time by 31 days
    await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);

    const tx = await contract.connect(company).releasePayment(1);
    await tx.wait();

    const updated = await contract.agreements(1);
    expect(updated.active).to.equal(false);
    console.log("✅ Payment released and agreement marked inactive");
  });

  it("Should revert if payment is too early", async () => {
    const now = Math.floor(Date.now() / 1000);
    const end = now + 30 * 24 * 60 * 60;

    await contract.connect(company).createAgreement(
      freelancer.address,
      "Backend Dev",
      now,
      end,
      "ipfs://backend_metadata",
      { value: ethers.parseEther("1.0") }
    );

    await expect(
      contract.connect(company).releasePayment(1)
    ).to.be.revertedWith("Too early to release");

    console.log("✅ Properly prevented early release");
  });
});
