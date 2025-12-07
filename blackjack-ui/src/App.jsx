import { useState } from "react";
import { ethers } from "ethers";

import nftAbi from "./abis/BlackjackNFT.json";
import gameAbi from "./abis/BlackjackGame.json";

import Game from "./Game";
import "./App.css";

const NFT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const GAME_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export default function App() {
  const [account, setAccount] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [gameContract, setGameContract] = useState(null);
  const [hasNft, setHasNft] = useState(false);

  // ⭐ NEW: trạng thái để chuyển sang game UI
  const [inGame, setInGame] = useState(false);

  /* ---------------- CONNECT WALLET ----------------- */
  const connectWallet = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      setAccount(accounts[0]);

      const nftC = new ethers.Contract(NFT_ADDRESS, nftAbi.abi, signer);
      const gameC = new ethers.Contract(GAME_ADDRESS, gameAbi.abi, signer);

      setNftContract(nftC);
      setGameContract(gameC);

      const bal = await nftC.balanceOf(accounts[0]);
      setHasNft(bal > 0n);

    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------------- MINT NFT ---------------------- */
  const mintNft = async () => {
    try {
      const tx = await nftContract.mintPass({
        value: ethers.parseEther("0.01"),
      });
      await tx.wait();

      const bal = await nftContract.balanceOf(account);
      setHasNft(bal > 0n);

    } catch (err) {
      console.error(err);
    }
  };

  /* =======================================================
      SCREEN LOGIC (3 màn hình)
  ======================================================== */

  // ⭐ MÀN HÌNH 3 → VÀO GAME (ẩn hết header)
  if (inGame) {
    return (
      <div className="game-wrapper">
        <Game gameContract={gameContract} />
      </div>
    );
  }

  // ⭐ MÀN HÌNH 1 → CHƯA KẾT NỐI VÍ
  if (!account) {
    return (
      <div className="center-screen">
        <h1 className="casino-title">BLACKJACK NFT</h1>
        <button className="main-btn" onClick={connectWallet}>
          KẾT NỐI METAMASK
        </button>
      </div>
    );
  }

  // ⭐ MÀN HÌNH 2 → KẾT NỐI VÍ NHƯNG CHƯA MINT NFT
  if (!hasNft) {
    return (
      <div className="center-screen">
        <h1 className="casino-title">BLACKJACK NFT</h1>

        <p className="address-left">Đăng nhập: {account}</p>

        <button className="mint-btn" onClick={mintNft}>
          Mint NFT (0.01 ETH)
        </button>
      </div>
    );
  }

  // ⭐ MÀN HÌNH 2.5 → ĐÃ MINT NFT → NÚT "Vào game"
  return (
    <div className="center-screen">
      <h1 className="casino-title">BLACKJACK NFT</h1>

      <p className="status-left">✔ Bạn đã sở hữu NFT</p>

      <button className="main-btn" onClick={() => setInGame(true)}>
        VÀO CHƠI BLACKJACK
      </button>
    </div>
  );
}
