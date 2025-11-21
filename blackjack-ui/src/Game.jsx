import { useState } from "react";

function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const deck = [];
  for (let s of suits) {
    for (let v of values) {
      deck.push({ suit: s, value: v });
    }
  }
  return deck;
}

function shuffle(deck) {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function calcScore(hand) {
  let total = 0;
  let aces = 0;

  for (let c of hand) {
    if (c.value === "A") {
      total += 1;
      aces++;
    } else if (["J","Q","K"].includes(c.value)) {
      total += 10;
    } else {
      total += parseInt(c.value);
    }
  }

  while (aces > 0 && total + 10 <= 21) {
    total += 10;
    aces--;
  }

  return total;
}

export default function Game({ gameContract }) {
  const [deck, setDeck] = useState([]);
  const [player, setPlayer] = useState([]);
  const [dealer, setDealer] = useState([]);
  const [msg, setMsg] = useState("Nhấn Deal để bắt đầu!");
  const [end, setEnd] = useState(false);

  const deal = () => {
    let d = shuffle(createDeck());
    const p = [d.pop(), d.pop()];
    const dl = [d.pop(), d.pop()];
    setDeck(d);
    setPlayer(p);
    setDealer(dl);
    setMsg("Đang chơi...");
    setEnd(false);
  };

  const hit = () => {
    if (end) return;
    let d = [...deck];
    let p = [...player, d.pop()];
    setDeck(d);
    setPlayer(p);

    const score = calcScore(p);
    if (score > 21) {
      setMsg("Bạn bust! Thua.");
      finish("lose", score, calcScore(dealer));
    }
  };

  const stand = () => {
    if (end) return;
    let d = [...deck];
    let dl = [...dealer];

    while (calcScore(dl) < 17) {
      dl.push(d.pop());
    }

    setDealer(dl);

    const pScore = calcScore(player);
    const dScore = calcScore(dl);

    let result = "draw";
    if (pScore > dScore || dScore > 21) result = "win";
    else if (pScore < dScore) result = "lose";

    setMsg(result === "win" ? "Bạn thắng!" :
           result === "lose" ? "Bạn thua!" : "Hòa!");

    finish(result, pScore, dScore);
  };

  const finish = async (result, pScore, dScore) => {
    setEnd(true);
    const enumRes = result === "win" ? 2 : result === "draw" ? 1 : 0;

    try {
      const tx = await gameContract.recordResult(pScore, dScore, enumRes);
      await tx.wait();
      console.log("Đã ghi on-chain");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Blackjack</h2>
      <p>{msg}</p>

      <div style={{ display: "flex", gap: 40 }}>
        <div>
          <h3>Bạn ({calcScore(player)})</h3>
          {player.map((c,i)=><span key={i}>[{c.value}{c.suit}] </span>)}
        </div>

        <div>
          <h3>Dealer ({end ? calcScore(dealer) : "?"})</h3>
          {dealer.map((c,i)=>
            <span key={i}>{end||i===0 ? `[${c.value}${c.suit}]` : "[??]"} </span>
          )}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={deal}>Deal</button>
        <button onClick={hit} disabled={end}>Hit</button>
        <button onClick={stand} disabled={end}>Stand</button>
      </div>
    </div>
  );
}
