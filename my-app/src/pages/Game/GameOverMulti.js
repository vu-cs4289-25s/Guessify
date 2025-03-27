import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../../components/Navbar/Navbar";
import "./GameOver.css";

const GameOverMulti = () => {
  const { roomCode } = useParams();
  const [usernamesMap, setUsernamesMap] = useState({});
  const [players, setPlayers] = useState([]);
  const [genre, setGenre] = useState("");

  useEffect(() => {
    const fetchScores = async () => {
      const ref = doc(db, "gamesMulti", roomCode);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setPlayers(data.players || []);
        setGenre(data.genre || "");
        fetchUsernames(data.players || []);
      } else {
        console.error("No game data found for room:", roomCode);
      }
    };

    const fetchUsernames = async (playerList) => {
      const map = {};
      await Promise.all(
        playerList.map(async ({ userId }) => {
          const ref = doc(db, "users", userId);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            map[userId] = snap.data().displayName?.split(" ")[0] || "Anon";
          } else {
            map[userId] = "Anon";
          }
        })
      );
      setUsernamesMap(map);
    };

    fetchScores();
  }, [roomCode]);

  const sortedScores = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="leaderboard-container">
      <Navbar />
      <div className="leaderboard-overlay">
        <h1 className="leaderboard-title">GAME OVER</h1>
        <h2 className="leaderboard-sub-title">{genre || "Final Rankings"}</h2>

        <div className="leaderboard-columns">
          {/* RANK */}
          <div className="leaderboard-col-left">
            <p className="leaderboard-col-title">RANK</p>
            <br />
            {sortedScores.map((_, i) => (
              <p key={i}>{i + 1}</p>
            ))}
          </div>

          {/* NAME */}
          <div className="leaderboard-col-mid">
            <p className="leaderboard-col-title">NAME</p>
            <br />
            {sortedScores.map((entry) => (
              <p key={entry.userId}>{usernamesMap[entry.userId] || "---"}</p>
            ))}
          </div>

          {/* SCORE */}
          <div className="leaderboard-col-right">
            <p className="leaderboard-col-title">SCORE</p>
            <br />
            {sortedScores.map((entry) => (
              <p key={entry.userId}>{entry.score}</p>
            ))}
          </div>

          {/* FASTEST GUESS */}
          <div className="leaderboard-col-right">
            <p className="leaderboard-col-title">FASTEST GUESS</p>
            <br />
            {sortedScores.map((entry) => (
              <p key={entry.userId}>
                {entry.fastestGuess != null ? `${entry.fastestGuess}s` : "N/A"}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverMulti;
