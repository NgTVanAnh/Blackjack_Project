import { useState } from "react";

/* =============================
    TẠO ĐƯỜNG DẪN ẢNH LÁ BÀI
============================= */
function getCardImage(card) {
  const suitMap = { "♣": "C", "♦": "D", "♥": "H", "♠": "S" };
  const folderMap = { C: "clubs", D: "diamonds", H: "hearts", S: "spades" };

  const value = card.value;
  const suit = suitMap[card.suit];
  const folder = folderMap[suit];

  return `/cards/${folder}/${value}${suit}.png`;
}

/* Hiển thị lá bài */
function Card({ card, hidden }) {
  if (hidden) {
    return <img className="card-img" src="/cards/back.png" alt="Hidden" />;
  }

  return (
    <img
      className="card-img"
      src={getCardImage(card)}
      alt={card.value + card.suit}
    />
  );
}

/* =============================
       TẠO BỘ BÀI & TÍNH ĐIỂM
============================= */
function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const deck = [];
  for (let s of suits) for (let v of values) deck.push({ suit: s, value: v });
  return deck;
}

function shuffle(deck) {
  let d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.random() * (i + 1) | 0;
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function calcScore(hand) {
  let total = 0;
  let aces = 0;

  for (let c of hand) {
    if (c.value === "A") { total += 1; aces++; }
    else if ("JQK".includes(c.value)) total += 10;
    else total += parseInt(c.value);
  }

  while (aces > 0 && total + 10 <= 21) {
    total += 10;
    aces--;
  }

  return total;
}

/* =============================
            GAME UI
============================= */
export default function Game({ gameContract }) {
  const [deck, setDeck] = useState([]);
  const [player, setPlayer] = useState([]);
  const [dealer, setDealer] = useState([]);
  const [msg, setMsg] = useState("Nhấn Deal để bắt đầu!");
  const [end, setEnd] = useState(false);

  /* ===== DEAL ===== */
  const deal = () => {
    const d = shuffle(createDeck());
    setPlayer([d.pop(), d.pop()]);
    setDealer([d.pop(), d.pop()]);
    setDeck(d);

    setMsg("ĐANG CHƠI...");
    setEnd(false);
  };

  /* ===== HIT ===== */
  const hit = () => {
    if (end) return;

    const d = [...deck];
    const p = [...player, d.pop()];

    setDeck(d);
    setPlayer(p);

    if (calcScore(p) > 21) {
      setMsg("BẠN BUST! THUA.");
      finish("LOSE", calcScore(p), calcScore(dealer));
    }
  };

  /* ===== STAND ===== */
  const stand = () => {
    if (end) return;

    const d = [...deck];
    let dl = [...dealer];

    while (calcScore(dl) < 17) dl.push(d.pop());
    setDealer(dl);

    const pScore = calcScore(player);
    const dScore = calcScore(dl);

    const result =
      pScore > dScore || dScore > 21 ? "WIN" :
      pScore < dScore ? "LOSE" : "DRAW";

    setMsg(
      result === "WIN" ? "BẠN THẮNG!" :
      result === "LOSE" ? "BẠN THUA!" :
      "HÒA!"
    );

    finish(result, pScore, dScore);
  };

  /* ===== GHI ONCHAIN ===== */
  const finish = async (result, pScore, dScore) => {
    setEnd(true);

    const enumRes = result === "WIN" ? 2 : result === "DRAW" ? 1 : 0;

    try {
      const tx = await gameContract.recordResult(pScore, dScore, enumRes);
      await tx.wait();
    } catch (err) {
      console.error(err);
    }
  };

  /* ==============================
            UI GIAO DIỆN
  ============================== */
  return (
    <div className="game-container">

      {/* Dealer trên */}
      <div className="board-row">
        <h3>Dealer ({end ? calcScore(dealer) : "?"})</h3>
        <div className="hand">
          {dealer.map((c, i) => (
            <Card key={i} card={c} hidden={!end && i === 1} />
          ))}
        </div>
      </div>

      {/* Kết quả + hiệu ứng */}
      <div className="result-banner">
        <h2 className={end ? "explosion-text" : ""}>{msg}</h2>
      </div>

      {/* Player dưới */}
      <div className="board-row">
        <h3>Bạn ({calcScore(player)})</h3>
        <div className="hand">
          {player.map((c, i) => (
            <Card key={i} card={c} />
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="controls">
        <button onClick={deal}>Deal</button>
        <button onClick={hit} disabled={end}>Hit</button>
        <button onClick={stand} disabled={end}>Stand</button>
      </div>
    </div>
  );
}
