//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FIR {
    string public name;
    address public owner;

    using Counters for Counters.Counter;
    Counters.Counter private _ComplaintIds;

    struct Complaint {
      uint id;
      string title;
      string content;
      bool published;
    }
    /* mappings can be seen as hash tables */
    /* here we create lookups for Complaints by id and Complaints by ipfs hash */
    mapping(uint => Complaint) private idToComplaint;
    mapping(string => Complaint) private hashToComplaint;

    /* events facilitate communication between smart contractsand their user interfaces  */
    /* i.e. we can create listeners for events in the client and use them in The Graph  */
    event ComplaintCreated(uint id, string title, string hash);
    event ComplaintUpdated(uint id, string title, string hash, bool published);

    /* when the blog is deployed, give it a name */
    /* also set the creator as the owner of the contract */
    constructor(string memory _name) {
        console.log("Deploying FIR with name:", _name);
        name = _name;
        owner = msg.sender;
    }

    function updateName(string memory _name) public {
        name = _name;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    /* fetches an individual Complaint by the content hash */
    function fetchComplaint(string memory hash) public view returns(Complaint memory){
      return hashToComplaint[hash];
    }

    /* creates a new Complaint */
    function createComplaint(string memory title, string memory hash) public onlyOwner {
        _ComplaintIds.increment();
        uint ComplaintId = _ComplaintIds.current();
        Complaint storage Complaint = idToComplaint[ComplaintId];
        Complaint.id = ComplaintId;
        Complaint.title = title;
        Complaint.published = true;
        Complaint.content = hash;
        hashToComplaint[hash] = Complaint;
        emit ComplaintCreated(ComplaintId, title, hash);
    }

    /* updates an existing Complaint */
    function updateComplaint(uint ComplaintId, string memory title, string memory hash, bool published) public onlyOwner {
        Complaint storage Complaint =  idToComplaint[ComplaintId];
        Complaint.title = title;
        Complaint.published = published;
        Complaint.content = hash;
        idToComplaint[ComplaintId] = Complaint;
        hashToComplaint[hash] = Complaint;
        emit ComplaintUpdated(Complaint.id, title, hash, published);
    }

    /* fetches all Complaints */
    function fetchComplaints() public view returns (Complaint[] memory) {
        uint itemCount = _ComplaintIds.current();

        Complaint[] memory Complaints = new Complaint[](itemCount);
        for (uint i = 0; i < itemCount; i++) {
            uint currentId = i + 1;
            Complaint storage currentItem = idToComplaint[currentId];
            Complaints[i] = currentItem;
        }
        return Complaints;
    }

    /* this modifier means only the contract owner can */
    /* invoke the function */
    modifier onlyOwner() {
      require(msg.sender == owner);
    _;
  }
}