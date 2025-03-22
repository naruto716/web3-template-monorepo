// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Talents {
    struct Freelancer {
        string name;
        address wallet;
        string profileId;
    }

    // Mapping from wallet address to freelancer info
    mapping(address => Freelancer) public freelancers;

    event FreelancerCreated(
        address indexed wallet,
        string name,
        string profileId
    );

    /// ✅ Store freelancer info on-chain
    function createFreelancer(string memory name, string memory profileId) external {
        require(bytes(name).length > 0, "Name required");
        require(bytes(profileId).length > 0, "Profile ID required");

        freelancers[msg.sender] = Freelancer({
            name: name,
            wallet: msg.sender,
            profileId: profileId
        });

        emit FreelancerCreated(msg.sender, name, profileId);
    }

    /// ✅ Read freelancer info from on-chain
    function getFreelancer(address wallet) external view returns (string memory, address, string memory) {
        Freelancer memory f = freelancers[wallet];
        return (f.name, f.wallet, f.profileId);
    }
}