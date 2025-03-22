// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SkillNFT_And_Escrow is ERC721URIStorage, Ownable {
    struct Agreement {
        address company;
        address freelancer;
        string skill;
        uint256 startDate;
        uint256 endDate;
        uint256 payment;
        bool active;
        uint256 lastPaidTime;
    }

    uint256 public agreementCount;
    mapping(uint256 => Agreement) public agreements;
    mapping(address => uint256) public freelancerBalance;

    event AgreementCreated(uint256 agreementId, address freelancer, address company, string skill, uint256 payment);
    event PaymentReleased(address freelancer, uint256 amount);
    event NFTMinted(address receiver, uint256 tokenId, string tokenURI);

    constructor() ERC721("EmploymentNFT", "EMP") Ownable(msg.sender) {}

    /// @notice Modifier to ensure only the hiring company can release payment
    modifier onlyCompany(uint256 _id) {
        require(msg.sender == agreements[_id].company, "Not the company for this agreement");
        _;
    }

    /// @notice Create an agreement and mint a skill NFT
    function createAgreement(
        address _freelancer,
        string memory _skill,
        uint256 _startDate,
        uint256 _endDate,
        string memory _tokenURI
    ) external payable {
        require(msg.value > 0, "Payment required");
        require(_endDate > _startDate, "Invalid dates");

        agreementCount++;
        agreements[agreementCount] = Agreement({
            company: msg.sender,
            freelancer: _freelancer,
            skill: _skill,
            startDate: _startDate,
            endDate: _endDate,
            payment: msg.value,
            active: true,
            lastPaidTime: block.timestamp
        });

        // Mint NFT to company as proof of hiring
        _mint(msg.sender, agreementCount);
        _setTokenURI(agreementCount, _tokenURI);

        emit NFTMinted(msg.sender, agreementCount, _tokenURI);
        emit AgreementCreated(agreementCount, _freelancer, msg.sender, _skill, msg.value);
    }

    /// @notice Release part of the escrowed funds to the freelancer
    function releasePayment(uint256 _agreementId) external onlyCompany(_agreementId) {
        Agreement storage ag = agreements[_agreementId];
        require(ag.active, "Agreement is not active");
        require(block.timestamp >= ag.lastPaidTime + 30 days, "Too early to release payment");

        uint256 duration = ag.endDate - ag.startDate;
        uint256 monthlyPay = ag.payment * 30 days / duration;

        require(monthlyPay <= ag.payment, "Payment exceeds remaining balance");

        ag.payment -= monthlyPay;
        ag.lastPaidTime = block.timestamp;

        payable(ag.freelancer).transfer(monthlyPay);
        emit PaymentReleased(ag.freelancer, monthlyPay);

        if (ag.payment == 0) {
            ag.active = false;
        }
    }

    /// @notice View full agreement details
    function getAgreement(uint256 _agreementId) external view returns (Agreement memory) {
        return agreements[_agreementId];
    }
}
