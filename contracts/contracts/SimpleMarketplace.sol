// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title SimpleMarketplace
 * @dev A simple marketplace for buying and selling digital items
 */
contract SimpleMarketplace {
    // Item structure
    struct Item {
        uint256 id;
        address seller;
        string name;
        string description;
        uint256 price;
        bool isForSale;
    }

    // Mapping from item ID to item data
    mapping(uint256 => Item) public items;
    
    // Total number of items
    uint256 public itemCount;
    
    // Platform fee percentage (0.5%)
    uint256 public feePercentage = 50; // Out of 10000 (50 = 0.5%)
    
    // Platform fee recipient
    address public feeRecipient;
    
    // Events
    event ItemListed(uint256 indexed itemId, address indexed seller, string name, uint256 price);
    event ItemSold(uint256 indexed itemId, address indexed seller, address indexed buyer, uint256 price);
    event ItemPriceChanged(uint256 indexed itemId, uint256 newPrice);
    event ItemRemoved(uint256 indexed itemId);
    
    // Constructor
    constructor() {
        feeRecipient = msg.sender;
    }
    
    // List a new item for sale
    function listItem(string memory _name, string memory _description, uint256 _price) public returns (uint256) {
        require(_price > 0, "Price must be greater than zero");
        
        itemCount++;
        uint256 newItemId = itemCount;
        
        items[newItemId] = Item({
            id: newItemId,
            seller: msg.sender,
            name: _name,
            description: _description,
            price: _price,
            isForSale: true
        });
        
        emit ItemListed(newItemId, msg.sender, _name, _price);
        
        return newItemId;
    }
    
    // Purchase an item
    function buyItem(uint256 _itemId) public payable {
        Item storage item = items[_itemId];
        
        require(item.id != 0, "Item does not exist");
        require(item.isForSale, "Item is not for sale");
        require(msg.sender != item.seller, "Seller cannot buy their own item");
        require(msg.value >= item.price, "Insufficient funds sent");
        
        // Calculate platform fee
        uint256 fee = (item.price * feePercentage) / 10000;
        uint256 sellerAmount = item.price - fee;
        
        // Transfer funds
        (bool feeSuccess, ) = feeRecipient.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");
        
        (bool sellerSuccess, ) = item.seller.call{value: sellerAmount}("");
        require(sellerSuccess, "Seller transfer failed");
        
        // Refund excess payment
        if (msg.value > item.price) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - item.price}("");
            require(refundSuccess, "Refund transfer failed");
        }
        
        // Mark item as sold
        item.isForSale = false;
        
        emit ItemSold(_itemId, item.seller, msg.sender, item.price);
    }
    
    // Change the price of an item
    function changePrice(uint256 _itemId, uint256 _newPrice) public {
        Item storage item = items[_itemId];
        
        require(item.id != 0, "Item does not exist");
        require(msg.sender == item.seller, "Only seller can change price");
        require(_newPrice > 0, "Price must be greater than zero");
        
        item.price = _newPrice;
        
        emit ItemPriceChanged(_itemId, _newPrice);
    }
    
    // Remove an item from sale
    function removeFromSale(uint256 _itemId) public {
        Item storage item = items[_itemId];
        
        require(item.id != 0, "Item does not exist");
        require(msg.sender == item.seller, "Only seller can remove item");
        require(item.isForSale, "Item is not for sale");
        
        item.isForSale = false;
        
        emit ItemRemoved(_itemId);
    }
    
    // Re-list an item for sale
    function relistItem(uint256 _itemId, uint256 _price) public {
        Item storage item = items[_itemId];
        
        require(item.id != 0, "Item does not exist");
        require(msg.sender == item.seller, "Only seller can relist item");
        require(!item.isForSale, "Item is already for sale");
        require(_price > 0, "Price must be greater than zero");
        
        item.isForSale = true;
        item.price = _price;
        
        emit ItemListed(_itemId, msg.sender, item.name, _price);
    }
    
    // Get an item by ID
    function getItem(uint256 _itemId) public view returns (
        uint256 id,
        address seller,
        string memory name,
        string memory description,
        uint256 price,
        bool isForSale
    ) {
        Item memory item = items[_itemId];
        require(item.id != 0, "Item does not exist");
        
        return (
            item.id,
            item.seller,
            item.name,
            item.description,
            item.price,
            item.isForSale
        );
    }
    
    // Get all items for sale
    function getItemsForSale() public view returns (uint256[] memory) {
        uint256 forSaleCount = 0;
        
        // Count items for sale
        for (uint256 i = 1; i <= itemCount; i++) {
            if (items[i].isForSale) {
                forSaleCount++;
            }
        }
        
        // Populate array with IDs of items for sale
        uint256[] memory forSaleItems = new uint256[](forSaleCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= itemCount; i++) {
            if (items[i].isForSale) {
                forSaleItems[index] = i;
                index++;
            }
        }
        
        return forSaleItems;
    }
    
    // Get all items sold by a specific seller
    function getSellerItems(address _seller) public view returns (uint256[] memory) {
        uint256 sellerItemCount = 0;
        
        // Count seller items
        for (uint256 i = 1; i <= itemCount; i++) {
            if (items[i].seller == _seller) {
                sellerItemCount++;
            }
        }
        
        // Populate array with IDs of seller's items
        uint256[] memory sellerItems = new uint256[](sellerItemCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= itemCount; i++) {
            if (items[i].seller == _seller) {
                sellerItems[index] = i;
                index++;
            }
        }
        
        return sellerItems;
    }
    
    // Set the fee percentage (only fee recipient can change it)
    function setFeePercentage(uint256 _feePercentage) public {
        require(msg.sender == feeRecipient, "Only fee recipient can change fee");
        require(_feePercentage <= 1000, "Fee cannot exceed 10%");
        
        feePercentage = _feePercentage;
    }
    
    // Set a new fee recipient (only current fee recipient can change it)
    function setFeeRecipient(address _feeRecipient) public {
        require(msg.sender == feeRecipient, "Only current fee recipient can transfer");
        require(_feeRecipient != address(0), "Cannot set to zero address");
        
        feeRecipient = _feeRecipient;
    }
} 