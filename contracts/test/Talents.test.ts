import { expect } from "chai";
import { ethers } from "hardhat";
import { Talents } from "../typechain-types";

describe("Talents", function () {
  let talents: Talents;
  let company: any;
  let freelancer: any;

  const ONE_ETH = ethers.parseEther("1.0");

  beforeEach(async () => {
    [company, freelancer] = await ethers.getSigners();
    const TalentsFactory = await ethers.getContractFactory("Talents");
    talents = await TalentsFactory.deploy();
    await talents.waitForDeployment();
  });

  it("should deploy successfully", async () => {
    expect(talents.target).to.be.properAddress;
  });

  it("should create an agreement and emit event", async () => {
    const startDate = Math.floor(Date.now() / 1000);
    const endDate = startDate + 7 * 24 * 60 * 60; // 1 week later

    await expect(
      talents.connect(company).createAgreement(
        freelancer.address,
        startDate,
        endDate,
        { value: ONE_ETH }
      )
    )
      .to.emit(talents, "AgreementCreated")
      .withArgs(1, company.address, freelancer.address, startDate, endDate, ONE_ETH);

    const agreement = await talents.getAgreement(1);
    expect(agreement.company).to.equal(company.address);
    expect(agreement.freelancer).to.equal(freelancer.address);
    expect(agreement.active).to.equal(true);
  });

  it("should return active agreement IDs", async () => {
    const now = Math.floor(Date.now() / 1000);
    await talents.connect(company).createAgreement(freelancer.address, now, now + 1000, {
      value: ONE_ETH,
    });

    const active = await talents.getActiveAgreements(freelancer.address);
    expect(active.length).to.equal(1);
    expect(active[0]).to.equal(1);
  });

  it("should complete the agreement and transfer ETH", async () => {
    const now = Math.floor(Date.now() / 1000);
    await talents.connect(company).createAgreement(freelancer.address, now, now + 1000, {
      value: ONE_ETH,
    });

    const initialBalance = await ethers.provider.getBalance(freelancer.address);

    const tx = await talents.connect(company).completeAgreement(1);
    await tx.wait();

    const agreement = await talents.getAgreement(1);
    expect(agreement.active).to.equal(false);

    const finalBalance = await ethers.provider.getBalance(freelancer.address);
    expect(finalBalance).to.be.gt(initialBalance);
  });

  it("should not allow non-company to complete agreement", async () => {
    const now = Math.floor(Date.now() / 1000);
    await talents.connect(company).createAgreement(freelancer.address, now, now + 1000, {
      value: ONE_ETH,
    });

    await expect(
      talents.connect(freelancer).completeAgreement(1)
    ).to.be.revertedWith("Only company can complete");
  });

  it("should revert if payment is 0 or invalid date", async () => {
    const now = Math.floor(Date.now() / 1000);

    await expect(
      talents.connect(company).createAgreement(freelancer.address, now, now + 1000)
    ).to.be.revertedWith("Payment required");

    await expect(
      talents.connect(company).createAgreement(freelancer.address, now + 1000, now, {
        value: ONE_ETH,
      })
    ).to.be.revertedWith("Invalid date range");
  });
});
