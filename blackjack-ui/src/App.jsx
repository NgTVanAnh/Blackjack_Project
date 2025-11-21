import { useState } from "react";
import { ethers } from "ethers";
import nftAbi from "./abis/BlackjackNFT.json";
import gameAbi from "./abis/BlackjackGame.json";
import Game from "./Game";

// === ĐỊA CHỈ CONTRACT (copy từ Hardhat) ===
const NFT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const GAME_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

function App() {
  const [account, setAccount] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [gameContract, setGameContract] = useState(null);
  const [hasNft, setHasNft] = useState(false);

  // ---- KẾT NỐI METAMASK ----
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Hãy cài MetaMask!");
      return;
    }

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
      alert("Kết nối MetaMask thất bại");
    }
  };

  // ---- MINT NFT ----
  const mintNft = async () => {
    if (!nftContract) return;

    try {
      const tx = await nftContract.mintPass({
        value: ethers.parseEther("0.01"),
      });
      await tx.wait();

      alert("Mint NFT thành công!");

      const bal = await nftContract.balanceOf(account);
      setHasNft(bal > 0n);
    } catch (err) {
  console.error("Mint NFT Error:", err);
  alert("Mint thất bại: " + err.message);
}
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>🎮 Blackjack NFT</h1>

      {!account && (
        <button onClick={connectWallet}>Kết nối MetaMask</button>
      )}

      {account && (
        <>
          <p>Đang đăng nhập: {account}</p>

          {!hasNft ? (
            <button onClick={mintNft}>Mint NFT 0.01 ETH</button>
          ) : (
            <p>✔ Bạn đã sở hữu NFT — có thể chơi!</p>
          )}

          {hasNft && <Game gameContract={gameContract} />}
        </>
      )}
    </div>
  );
}

export default App;
