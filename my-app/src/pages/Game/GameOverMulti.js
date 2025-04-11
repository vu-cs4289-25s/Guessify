import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "../../global.css";
import "./GameOver.css";
import "./GameOverMulti.css";

const GameOverMulti = () => {
  const { roomCode } = useParams();
  const [usernamesMap, setUsernamesMap] = useState({});
  const [players, setPlayers] = useState([]);
  const [genre, setGenre] = useState("");
  const [missedTheMost, setMissedTheMost] = useState("");
  const [quickestGuesser, setQuickestGuesser] = useState("");
  const [fastestGuessedSong, setFastestGuessedSong] = useState("");

  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchScores = async () => {
      const ref = doc(db, "gamesMulti", roomCode);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();

        const updatedPlayers = (data.players || []).map(player => ({
          ...player,
          missedCount: data.missedCounts?.[player.userId] || 0,
        }));

        setPlayers(updatedPlayers);

        console.log("Players Data:", data.players); // TODO: remove this later
        setGenre(data.genre || "");
        setQuickestGuesser(data.quickestGuesser || "");
        fetchUsernames(data.players || []);
        setFastestGuessedSong(data.fastestGuessedSong || "");
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
  const currentUserRank = sortedScores.findIndex((p) => p.userId === currentUserId);

  const getTitleByRank = () => {
    switch (currentUserRank) {
      case 0:
        return `YOU WON ${genre.toUpperCase()}!`;
      case 1:
        return `YOU CAME SECOND FOR ${genre.toUpperCase()}!`;
      case 2:
        return `YOU CAME THIRD FOR ${genre.toUpperCase()}!`;
      default:
        return `WIN ${genre.toUpperCase()} NEXT TIME!`;
    }
  };

  const getMostMissed = () => {
    if (!players.length) return "N/A";

    const maxMissed = Math.max(...players.map(player => player.missedCount || 0));

    if (maxMissed === 0) return "No misses!";

    const mostMissedPlayers = players
      .filter(player => (player.missedCount || 0) === maxMissed)
      .map(player => usernamesMap[player.userId] || "Anon");

    return `${mostMissedPlayers.join(", ")} (${maxMissed} misses)`;
  };

  return (
    <div className="game-over-multi-container">
      <Navbar />
      <div className="game-over-multi-overlay">
        <h1 className="game-over-multi-title">{getTitleByRank()}</h1>

        {/* MAIN COLUMNS */}
        <div className="game-over-multi-columns">
          {/* RANK */}
          <div className="game-over-multi-col-left">
            <p className="game-over-multi-col-title">RANK</p>
            <br />
            {sortedScores.map((entry, i) => (
              <p
                key={entry.userId}
                className={entry.userId === currentUserId ? "current-user-name" : ""}
              >
                {i + 1}
              </p>
            ))}
          </div>

          {/* NAME */}
          <div className="game-over-multi-col-mid">
            <p className="game-over-multi-col-title">NAME</p>
            <br />
            {sortedScores.map((entry) => (
              <p
                key={entry.userId}
                className={entry.userId === currentUserId ? "current-user-name" : ""}
              >
                {usernamesMap[entry.userId] || "---"}
              </p>
            ))}
          </div>

          {/* SCORE */}
          <div className="game-over-multi-col-right">
            <p className="game-over-multi-col-title">SCORE</p>
            <br />
            {sortedScores.map((entry) => (
              <p
                key={entry.userId}
                className={entry.userId === currentUserId ? "current-user-score" : ""}
              >
                {entry.score}
              </p>
            ))}
          </div>
        </div>

        {/* STATS ROW */}
        <div className="game-over-multi-summary-row equal-width-cols">
          <div className="game-over-multi-summary-col">
            <p className="game-over-multi-col-title">MOST MISSED</p>
            <p>{getMostMissed()}</p>
          </div>
          <div className="game-over-multi-summary-col">
            <p className="game-over-multi-col-title">QUICKEST GUESSER</p>
            <p>{quickestGuesser || "N/A"}</p>
          </div>
          <div className="game-over-multi-summary-col">
            <p className="game-over-multi-col-title">FASTEST GUESSED SONG</p>
            <p>{fastestGuessedSong || "N/A"}</p>
          </div>
        </div>
        <Link to={`/game?userId=${currentUserId}`} className="play-again-button">
          PLAY AGAIN
        </Link>
      </div>
    </div>
  );
};

export default GameOverMulti;
