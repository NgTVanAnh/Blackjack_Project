// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BlackjackNFT is ERC721, Ownable {
    uint256 public nextTokenId;
    uint256 public constant PRICE = 0.01 ether;

    mapping(address => bool) public hasMinted;

    constructor() ERC721("Blackjack Pass", "BJPASS") Ownable(msg.sender) {}

    function mintPass() external payable {
        require(!hasMinted[msg.sender], "Already minted");
        require(msg.value >= PRICE, "Not enough ETH");

        uint256 tokenId = nextTokenId;
        nextTokenId++;

        _safeMint(msg.sender, tokenId);
        hasMinted[msg.sender] = true;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
