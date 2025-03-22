// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SkillNFT_And_Escrow is ERC721URIStorage, Ownable {
    struct FreelanceOffer {
        address freelancer;
        address company;
        string skillName;
        uint256 payment;
        uint256 offerId;
        uint256 startDate;
        uint256 endDate;
        bool isTraded;
        bool isPaid;
    }

    uint256 private _nextOfferId = 1;
    mapping(uint256 => FreelanceOffer) public offers;
    mapping(uint256 => uint256) public escrowBalances;

    event OfferNFTCreated(
        uint256 indexed tokenId,
        address indexed freelancer,
        address indexed company,
        uint256 payment,
        uint256 offerId
    );
    event OfferTraded(uint256 indexed tokenId, address company, uint256 payment);
    event PaymentReleased(uint256 indexed tokenId, address freelancer, uint256 payment);

    constructor() ERC721("FreelanceOffer", "FLNC") Ownable(msg.sender) {}

    /**
     * @notice Creates an NFT representing a freelance offer
     * @param company Address of the hiring company
     * @param skillName Name of the skill/service
     * @param payment Amount in ETH to be paid
     * @param startDate Unix timestamp for start date
     * @param endDate Unix timestamp for end date
     * @return tokenId The ID of the minted NFT
     */
    function createOfferNFT(
        address company,
        string memory skillName,
        uint256 payment,
        uint256 startDate,
        uint256 endDate
    ) external returns (uint256) {
        require(startDate > block.timestamp, "Start date must be in future");
        require(endDate > startDate, "End date must be after start date");
        require(payment > 0, "Payment must be greater than 0");

        uint256 tokenId = _nextOfferId++;
        
        offers[tokenId] = FreelanceOffer({
            freelancer: msg.sender,
            company: company,
            skillName: skillName,
            payment: payment,
            offerId: tokenId,
            startDate: startDate,
            endDate: endDate,
            isTraded: false,
            isPaid: false
        });

        _mint(msg.sender, tokenId);

        emit OfferNFTCreated(tokenId, msg.sender, company, payment, tokenId);
        return tokenId;
    }

    /**
     * @notice Company accepts offer by trading ETH for the NFT
     * @param tokenId The ID of the offer NFT
     */
    function tradeOfferNFT(uint256 tokenId) external payable {
        FreelanceOffer storage offer = offers[tokenId];
        require(!offer.isTraded, "Offer already traded");
        require(msg.sender == offer.company, "Only specified company can trade");
        require(msg.value == offer.payment, "Incorrect payment amount");
        require(ownerOf(tokenId) == offer.freelancer, "Freelancer must own NFT");

        // Transfer NFT from freelancer to company
        _transfer(offer.freelancer, offer.company, tokenId);
        
        // Store payment in escrow
        escrowBalances[tokenId] = msg.value;
        offer.isTraded = true;

        emit OfferTraded(tokenId, msg.sender, msg.value);
    }

    /**
     * @notice Releases payment to freelancer after end date
     * @param tokenId The ID of the completed offer
     */
    function releasePayment(uint256 tokenId) external {
        FreelanceOffer storage offer = offers[tokenId];
        require(offer.isTraded, "Offer not traded yet");
        require(!offer.isPaid, "Payment already released");
        require(block.timestamp >= offer.endDate, "End date not reached");

        uint256 payment = escrowBalances[tokenId];
        require(payment > 0, "No payment in escrow");

        // Mark as paid and clear escrow
        offer.isPaid = true;
        escrowBalances[tokenId] = 0;

        // Transfer payment to freelancer
        payable(offer.freelancer).transfer(payment);

        emit PaymentReleased(tokenId, offer.freelancer, payment);
    }

    /**
     * @notice View offer details
     * @param tokenId The ID of the offer NFT
     */
    function getOffer(uint256 tokenId) external view returns (FreelanceOffer memory) {
        return offers[tokenId];
    }
}
