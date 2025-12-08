import { useState, useEffect } from "react";

/* ===== LOAD SOUNDS ===== */
const bgMusic = new Audio("/sounds/bg.mp3");
const sndClick = new Audio("/sounds/click.mp3");
const sndFlip = new Audio("/sounds/flip.mp3");
const sndExplode = new Audio("/sounds/explode.mp3");

bgMusic.loop = true;
bgMusic.volume = 0.25;

/* =============================
    GET CARD IMAGE PATH
============================= */
function getCardImage(card) {
  const suitMap = { "♣": "C", "♦": "D", "♥": "H", "♠": "S" };
  const folderMap = { C: "clubs", D: "diamonds", H: "hearts", S: "spades" };

  return `/cards/${folderMap[suitMap[card.suit]]}/${card.value}${suitMap[card.suit]}.png`;
}

/* Card Component */
function Card({ card, hidden }) {
  const [fly, setFly] = useState(false);

  useEffect(() => {
    setFly(false);
    const t = setTimeout(() => setFly(true), 10);
    return () => clearTimeout(t);
  }, [card]);

  return (
    <img
      className={`card-img ${fly ? "card-fly" : ""}`}
      src={hidden ? "/cards/back.png" : getCardImage(card)}
      alt="card"
      draggable="false"
    />
  );
}



/* =============================
    CREATE DECK + SHUFFLE
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
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

/* =============================
        CALC SCORE
============================= */
function calcScore(hand) {
  let total = 0, aces = 0;
  for (let c of hand) {
    if (c.value === "A") total += 1, aces++;
    else if ("JQK".includes(c.value)) total += 10;
    else total += parseInt(c.value);
  }
  while (aces > 0 && total + 10 <= 21) total += 10, aces--;
  return total;
}

/* =============================
        GAME COMPONENT
============================= */
export default function Game({ gameContract }) {
  const [deck, setDeck] = useState([]);
  const [player, setPlayer] = useState([]);
  const [dealer, setDealer] = useState([]);
  const [msg, setMsg] = useState("Nhấn Deal để bắt đầu!");
  const [end, setEnd] = useState(false);
  const [explosion, setExplosion] = useState(false);

  useEffect(() => {
    sndClick.volume = 0.5;
    sndFlip.volume = 0.5;
    sndExplode.volume = 0.9;
  }, []);

  /* ========= DEAL ========= */
const deal = () => {
  bgMusic.play().catch(() => {});
  
  sndClick.play();

  const d = shuffle(createDeck());
  let newDeck = [...d];

  setPlayer([]);
  setDealer([]);
  setExplosion(false);
  setEnd(false);
  setMsg("ĐANG CHƠI...");

  const giveCard = (setter, delay) => {
    setTimeout(() => {
      sndFlip.currentTime = 0;
      sndFlip.play();

      const card = newDeck.pop();
      setter(prev => [...prev, { ...card, animated: true }]);
    }, delay);
  };

  // Chia như thật: Player → Dealer → Player → Dealer
  giveCard(setPlayer, 200);
  giveCard(setDealer, 550);
  giveCard(setPlayer, 900);
  giveCard(setDealer, 1250);

  setDeck(newDeck);
};



  /* ========= HIT ========= */
const hit = () => {
  if (end) return;

  sndClick.play();
  sndFlip.play();

  const d = [...deck];
  const newCard = { ...d.pop(), animated: true };

  setDeck(d);
  setPlayer(prev => [...prev, newCard]);

  if (calcScore([...player, newCard]) > 21) {
    finish("💀 BẠN BUST!");
  }
};

  /* ========= STAND ========= */
  const stand = () => {
    if (end) return;

    sndClick.play();

    let d = [...deck];
    let dl = [...dealer];

    while (calcScore(dl) < 17) {
      sndFlip.play();
      dl.push(d.pop());
    }

    setDealer(dl);

    const p = calcScore(player);
    const ds = calcScore(dl);

    if (p > ds || ds > 21) finish("🎉 BẠN THẮNG!");
    else if (p < ds) finish("💀 BẠN THUA!");
    else finish("🤝 HÒA!");
  };

  /* ========= FINISH ========= */
  const finish = (text) => {
    sndExplode.play();
    setMsg(text);
    setExplosion(true);
    setEnd(true);
  };

  return (
    <div className="game-wrapper">

      <div className="board-row">
        <h3>Dealer ({end ? calcScore(dealer) : "?"})</h3>
        <div className="hand">
          {dealer.map((c, i) => (
            <Card key={i} card={c} hidden={!end && i === 1} />
          ))}
        </div>
      </div>

      {explosion ? (
        <h1 className="explosion-text">{msg}</h1>
      ) : (
        <div className="result-banner"><h2>{msg}</h2></div>
      )}

      <div className="board-row">
        <h3>Bạn ({calcScore(player)})</h3>
        <div className="hand">
          {player.map((c, i) => (
            <Card key={i} card={c} />
          ))}
        </div>
      </div>

      <div className="controls">
        <button onClick={deal}>Deal</button>
        <button onClick={hit} disabled={end}>Hit</button>
        <button onClick={stand} disabled={end}>Stand</button>
      </div>

    </div>
  );
}
