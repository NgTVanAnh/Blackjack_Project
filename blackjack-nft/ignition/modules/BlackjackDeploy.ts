import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BlackjackDeployModule = buildModule("BlackjackDeployModule", (m) => {
  // Deploy contract NFT
  const nft = m.contract("BlackjackNFT");

  // Deploy Game contract, pass NFT address
  const game = m.contract("BlackjackGame", [nft]);

  return { nft, game };
});

export default BlackjackDeployModule;
