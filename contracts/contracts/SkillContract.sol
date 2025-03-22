// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SkillContract is ERC721URIStorage, Ownable {
    struct Agreement {
        address company;
        address freelancer;
        string skill;
        uint256 startDate;
        uint256 endDate;
        uint256 payment;
        bool active;
    }

    uint256 public agreementCount;
    mapping(uint256 => Agreement) public agreements;
    mapping(address => uint256) public freelancerBalance;

    event AgreementCreated(uint256 agreementId, address freelancer, address company, string skill, uint256 payment);
    event PaymentReleased(address freelancer, uint256 amount);

    // ✅ FIX: Remove `msg.sender` from `Ownable()`
    constructor() ERC721("EmploymentNFT", "EMP") Ownable(msg.sender) {}

    function createAgreement(
        address _freelancer,
        string memory _skill,
        uint256 _startDate,
        uint256 _endDate
    ) external payable {
        require(msg.value > 0, "Payment required");
        require(_endDate > _startDate, "Invalid date range");

        agreementCount++;
        agreements[agreementCount] = Agreement({
            company: msg.sender,
            freelancer: _freelancer,
            skill: _skill,
            startDate: _startDate,
            endDate: _endDate,
            payment: msg.value,
            active: true
        });

        freelancerBalance[_freelancer] += msg.value;

        emit AgreementCreated(agreementCount, _freelancer, msg.sender, _skill, msg.value);
    }

    function getAgreement(uint256 _agreementId) public view returns (Agreement memory) {
        return agreements[_agreementId];
    }

    function mintNFT(address _to, string memory _tokenURI) public onlyOwner {
        uint256 newItemId = agreementCount;
        _mint(_to, newItemId);
        _setTokenURI(newItemId, _tokenURI);
    }

    function withdrawPayments() external {
        uint256 amount = freelancerBalance[msg.sender];
        require(amount > 0, "No funds available");

        freelancerBalance[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit PaymentReleased(msg.sender, amount);
    }
}
