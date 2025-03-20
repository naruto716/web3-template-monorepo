import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleMarketplace } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SimpleMarketplace", function () {
  let marketplace: SimpleMarketplace;
  let owner: SignerWithAddress;
  let seller: SignerWithAddress;
  let buyer: SignerWithAddress;
  let itemId: number;

  const ITEM_PRICE = ethers.parseEther("0.1"); // 0.1 ETH

  beforeEach(async function () {
    // Get signers
    [owner, seller, buyer] = await ethers.getSigners();

    // Deploy the marketplace contract
    const SimpleMarketplaceFactory = await ethers.getContractFactory("SimpleMarketplace");
    marketplace = await SimpleMarketplaceFactory.deploy();

    // List an item for sale
    const tx = await marketplace.connect(seller).listItem(
      "Test Item",
      "This is a test item",
      ITEM_PRICE
    );
    
    // Get the itemId - simpler approach
    itemId = 1; // First item should have ID 1
  });

  describe("Basic functionality", function () {
    it("Should allow listing an item for sale", async function () {
      // Check the item details
      const item = await marketplace.getItem(itemId);
      expect(item.seller).to.equal(seller.address);
      expect(item.name).to.equal("Test Item");
      expect(item.description).to.equal("This is a test item");
      expect(item.price).to.equal(ITEM_PRICE);
      expect(item.isForSale).to.equal(true);
    });

    it("Should allow buying an item", async function () {
      // Get initial balances
      const initialSellerBalance = await ethers.provider.getBalance(seller.address);
      const initialFeeRecipientBalance = await ethers.provider.getBalance(owner.address);
      
      // Buy the item
      await marketplace.connect(buyer).buyItem(itemId, { value: ITEM_PRICE });
      
      // Check the item is no longer for sale
      const item = await marketplace.getItem(itemId);
      expect(item.isForSale).to.equal(false);
      
      // Calculate expected fee and seller amount
      const feePercentage = await marketplace.feePercentage();
      const expectedFee = ITEM_PRICE * BigInt(feePercentage) / BigInt(10000);
      const expectedSellerAmount = ITEM_PRICE - expectedFee;
      
      // Check balances were updated correctly
      const finalSellerBalance = await ethers.provider.getBalance(seller.address);
      const finalFeeRecipientBalance = await ethers.provider.getBalance(owner.address);
      
      // Verify seller received payment
      expect(finalSellerBalance - initialSellerBalance).to.equal(expectedSellerAmount);
      
      // Verify fee recipient received fee (with a small margin for gas costs)
      expect(finalFeeRecipientBalance - initialFeeRecipientBalance).to.be.closeTo(
        expectedFee,
        ethers.parseEther("0.001")
      );
    });

    it("Should allow changing the price of an item", async function () {
      const newPrice = ethers.parseEther("0.2");
      
      // Change the price
      await marketplace.connect(seller).changePrice(itemId, newPrice);
      
      // Check the price was updated
      const item = await marketplace.getItem(itemId);
      expect(item.price).to.equal(newPrice);
    });

    it("Should allow removing an item from sale", async function () {
      // Remove the item from sale
      await marketplace.connect(seller).removeFromSale(itemId);
      
      // Check the item is no longer for sale
      const item = await marketplace.getItem(itemId);
      expect(item.isForSale).to.equal(false);
    });

    it("Should allow relisting an item", async function () {
      // Remove the item from sale
      await marketplace.connect(seller).removeFromSale(itemId);
      
      // Relist the item
      const newPrice = ethers.parseEther("0.2");
      await marketplace.connect(seller).relistItem(itemId, newPrice);
      
      // Check the item is for sale again with the new price
      const item = await marketplace.getItem(itemId);
      expect(item.isForSale).to.equal(true);
      expect(item.price).to.equal(newPrice);
    });
  });

  describe("Access control", function () {
    it("Should not allow non-seller to change price", async function () {
      const newPrice = ethers.parseEther("0.2");
      
      // Try to change the price as non-seller
      await expect(
        marketplace.connect(buyer).changePrice(itemId, newPrice)
      ).to.be.revertedWith("Only seller can change price");
    });

    it("Should not allow non-seller to remove item from sale", async function () {
      // Try to remove the item as non-seller
      await expect(
        marketplace.connect(buyer).removeFromSale(itemId)
      ).to.be.revertedWith("Only seller can remove item");
    });

    it("Should not allow non-fee-recipient to change fee percentage", async function () {
      // Try to change fee percentage as non-fee-recipient
      await expect(
        marketplace.connect(seller).setFeePercentage(100)
      ).to.be.revertedWith("Only fee recipient can change fee");
    });
  });

  describe("Query functions", function () {
    it("Should return all items for sale", async function () {
      // List a second item
      await marketplace.connect(seller).listItem(
        "Another Item",
        "This is another test item",
        ITEM_PRICE
      );
      
      // Get items for sale
      const itemsForSale = await marketplace.getItemsForSale();
      
      // Should have two items for sale
      expect(itemsForSale.length).to.equal(2);
    });

    it("Should return all items by seller", async function () {
      // List a second item
      await marketplace.connect(seller).listItem(
        "Another Item",
        "This is another test item",
        ITEM_PRICE
      );
      
      // Get seller items
      const sellerItems = await marketplace.getSellerItems(seller.address);
      
      // Should have two items by the seller
      expect(sellerItems.length).to.equal(2);
    });
  });
}); 