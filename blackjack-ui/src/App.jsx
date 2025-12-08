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
  const [startGame, setStartGame] = useState(false);

  const connectWallet = async () => {
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
  };

  if (!account) {
    return (
      <div className="center-screen">
        <h1 className="casino-title">BLACKJACK NFT</h1>
        <button className="main-btn" onClick={connectWallet}>KẾT NỐI METAMASK</button>
      </div>
    );
  }

  if (account && hasNft && !startGame) {
    return (
      <div className="center-screen">
        <h1 className="casino-title">BLACKJACK NFT</h1>
        <p>Đăng nhập: {account}</p>
        <p style={{ color: "#00ff9d" }}>✔ Bạn đã sở hữu NFT</p>
        <button className="play-btn" onClick={() => setStartGame(true)}>PLAY ▶</button>
      </div>
    );
  }

  return (
    <div className="game-fullscreen">
      <Game gameContract={gameContract} />
    </div>
  );
}
