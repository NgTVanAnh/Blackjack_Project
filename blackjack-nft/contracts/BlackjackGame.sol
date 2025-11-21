// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BlackjackNFT.sol";

contract BlackjackGame {
    enum Result { Lose, Draw, Win }

    struct GameRecord {
        uint256 timestamp;
        uint8 playerScore;
        uint8 dealerScore;
        Result result;
    }

    BlackjackNFT public nftContract;

    mapping(address => GameRecord[]) public records;

    event GamePlayed(
        address indexed player,
        uint8 playerScore,
        uint8 dealerScore,
        Result result,
        uint256 timestamp
    );

    constructor(address _nftAddress) {
        nftContract = BlackjackNFT(_nftAddress);
    }

    modifier onlyNftHolder() {
        require(nftContract.balanceOf(msg.sender) > 0, "Need NFT to play");
        _;
    }

    function recordResult(
        uint8 _playerScore,
        uint8 _dealerScore,
        Result _result
    ) external onlyNftHolder {
        records[msg.sender].push(
            GameRecord(block.timestamp, _playerScore, _dealerScore, _result)
        );

        emit GamePlayed(
            msg.sender,
            _playerScore,
            _dealerScore,
            _result,
            block.timestamp
        );
    }

    function getMyRecords() external view returns (GameRecord[] memory) {
        return records[msg.sender];
    }
}
