import { expect } from "chai";
import { ethers } from "hardhat";

describe("Talents", function() {
  it("should deploy successfully", async function() {
    const Talents = await ethers.getContractFactory("Talents");
    const talents = await Talents.deploy();
    await talents.deploymentTransaction()!.wait();
    
    // Basic test to verify deployment
    expect(talents.target).to.be.properAddress;
  });
  
  // Add more tests as needed for your contract functionality
});