// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Talents {
    struct Agreement {
        address company;
        address freelancer;
        uint256 startDate;
        uint256 endDate;
        uint256 payment;
        bool active;
    }

    uint256 public agreementCount;
    mapping(uint256 => Agreement) public agreements;
    mapping(address => uint256[]) public freelancerAgreements;

    event AgreementCreated(
        uint256 indexed agreementId,
        address indexed company,
        address indexed freelancer,
        uint256 startDate,
        uint256 endDate,
        uint256 payment
    );

    /// @notice Create a new job agreement between a company and a freelancer
    function createAgreement(
        address freelancer,
        uint256 startDate,
        uint256 endDate
    ) external payable {
        require(msg.value > 0, "Payment required");
        require(endDate > startDate, "Invalid date range");

        agreementCount++;
        agreements[agreementCount] = Agreement({
            company: msg.sender,
            freelancer: freelancer,
            startDate: startDate,
            endDate: endDate,
            payment: msg.value,
            active: true
        });

        freelancerAgreements[freelancer].push(agreementCount);

        emit AgreementCreated(
            agreementCount,
            msg.sender,
            freelancer,
            startDate,
            endDate,
            msg.value
        );
    }

    /// @notice Get all active agreement IDs for a given freelancer
    function getActiveAgreements(address freelancer) external view returns (uint256[] memory activeIds) {
        uint256[] memory all = freelancerAgreements[freelancer];
        uint256 count;

        for (uint256 i = 0; i < all.length; i++) {
            if (agreements[all[i]].active) {
                count++;
            }
        }

        activeIds = new uint256[](count);
        uint256 idx;
        for (uint256 i = 0; i < all.length; i++) {
            if (agreements[all[i]].active) {
                activeIds[idx++] = all[i];
            }
        }
    }

    /// @notice Mark agreement as completed (only company can call)
    function completeAgreement(uint256 agreementId) external {
        Agreement storage ag = agreements[agreementId];
        require(ag.active, "Agreement already completed");
        require(msg.sender == ag.company, "Only company can complete");

        ag.active = false;
        payable(ag.freelancer).transfer(ag.payment);
    }

    /// @notice Get details of an agreement by ID
    function getAgreement(uint256 agreementId) external view returns (Agreement memory) {
        return agreements[agreementId];
    }
}