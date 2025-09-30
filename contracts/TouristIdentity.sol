// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TouristIdentity {
    struct Tourist {
        string name;
        string passportHash;
        uint256 arrivalDate;
        uint256 departureDate;
        string emergencyContact;
        bool isValid;
    }
    
    address public owner;
    mapping(string => Tourist) public tourists; // touristID -> Tourist
    mapping(address => string) public addressToTouristID;
    
    event TouristCreated(string touristID, string name, uint256 arrivalDate);
    event TouristVerified(string touristID, bool isValid);
    
    constructor() {
        owner = msg.sender;
    }
    
    function createTourist(
        string memory touristID,
        string memory name,
        string memory passportHash,
        uint256 arrivalDate,
        uint256 departureDate,
        string memory emergencyContact
    ) public {
        require(msg.sender == owner, "Only owner can create tourists");
        
        tourists[touristID] = Tourist({
            name: name,
            passportHash: passportHash,
            arrivalDate: arrivalDate,
            departureDate: departureDate,
            emergencyContact: emergencyContact,
            isValid: true
        });
        
        emit TouristCreated(touristID, name, arrivalDate);
    }
    
    function verifyTourist(string memory touristID) public view returns (bool) {
        Tourist memory tourist = tourists[touristID];
        if (!tourist.isValid) return false;
        if (block.timestamp < tourist.arrivalDate) return false;
        if (block.timestamp > tourist.departureDate) return false;
        return true;
    }
    
    function getTouristInfo(string memory touristID) public view returns (
        string memory name,
        uint256 arrivalDate,
        uint256 departureDate,
        bool isValid
    ) {
        Tourist memory tourist = tourists[touristID];
        return (tourist.name, tourist.arrivalDate, tourist.departureDate, tourist.isValid);
    }
}