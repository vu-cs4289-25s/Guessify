import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useUser } from "../../components/userContext";
import Navbar from "../../components/Navbar/Navbar";
import "./Leaderboard.css";

const Leaderboard = () => {
  const { userId } = useUser();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userBestScore, setUserBestScore] = useState(null);
  const [pointsAway, setPointsAway] = useState(null);
  const [usernames, setUsernames] = useState(null); // 🔄 Change initial state to null

  // Fetch top 5 scores for "TODAY'S TOP HITS"
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const gamesRef = collection(db, "games");
        const q = query(
          gamesRef,
          where("genre", "==", "TODAY'S TOP HITS"),
          orderBy("score", "desc")
        );
        const querySnapshot = await getDocs(q);

        const scoresMap = new Map(); // To track the highest score per user
        const userIds = new Set(); // To collect userIds for fetching usernames

        // Keep only the highest score for each user
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!scoresMap.has(data.userId)) {
            scoresMap.set(data.userId, data);
          }
          userIds.add(data.userId);
        });

        const leaderboard = Array.from(scoresMap.values())
          .sort((a, b) => b.score - a.score) // Sort by score in descending order
          .slice(0, 5); // Take only the top 5 entries

        setLeaderboardData(leaderboard);

        // Fetch usernames for leaderboard userIds
        const usernamesMap = {};
        await Promise.all(
          Array.from(userIds).map(async (uid) => {
            const userRef = doc(db, "users", uid);
            const userSnapshot = await getDoc(userRef);
            if (userSnapshot.exists()) {
              usernamesMap[uid] = userSnapshot.data().displayName || "---";
            }
          })
        );
        setUsernames(usernamesMap); // 🔄 Set usernames only after all are fetched

        // Determine user's best score
        const currentUserEntry = leaderboard.find(
          (entry) => entry.userId === userId
        );
        setUserBestScore(currentUserEntry ? currentUserEntry.score : null);

        // Calculate points away from the next rank for the current user
        if (currentUserEntry) {
          const userRank = leaderboard.findIndex(
            (entry) => entry.userId === userId
          );
          if (userRank > 0) {
            const nextRankScore = leaderboard[userRank - 1].score;
            setPointsAway(nextRankScore - currentUserEntry.score);
          } else {
            setPointsAway(null); // User is already at the top
          }
        }
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };

    fetchLeaderboard();
  }, [userId]);

  return (
    <div className="leaderboard-container">
      <Navbar />
      <div className="leaderboard-overlay">
        <h1 className="leaderboard-title">LEADERBOARD</h1>
        <h2 className="leaderboard-sub-title">TODAY'S TOP HITS</h2>

        {/* Results */}
        <div className="leaderboard-columns">
          <div className="leaderboard-col-left">
            <p className="leaderboard-col-title">RANK</p>
            <br />
            <p>
              <img src="/icons/rank1.png" alt="1" className="rank-one-icon" />
            </p>
            <p>
              <img src="/icons/rank2.png" alt="2" className="rank-two-icon" />
            </p>
            <p>
              <img src="/icons/rank3.png" alt="3" className="rank-three-icon" />
            </p>
            <p>4</p>
            <p>5</p>
          </div>

          <div className="leaderboard-col-mid">
            <p className="leaderboard-col-title">NAME</p>
            <br />
            {usernames === null
              ? Array(5)
                  .fill("---")
                  .map((_, index) => <p key={index}>---</p>)
              : [
                  ...leaderboardData,
                  ...Array(5 - leaderboardData.length).fill(null),
                ].map((entry, index) => (
                  <p
                    key={entry?.userId || `placeholder-${index}`}
                    style={{
                      color: entry?.userId === userId ? "#ffe283" : "#f3f3f3",
                    }}
                  >
                    {entry ? usernames[entry.userId] || "---" : "---"}
                  </p>
                ))}
          </div>

          <div className="leaderboard-col-right">
            <p className="leaderboard-col-title">SCORE</p>
            <br />
            {usernames === null
              ? Array(5)
                  .fill("---")
                  .map((_, index) => <p key={index}>---</p>)
              : [
                  ...leaderboardData,
                  ...Array(5 - leaderboardData.length).fill(null),
                ].map((entry, index) => (
                  <p
                    key={entry?.userId || `placeholder-score-${index}`}
                    style={{
                      color: entry?.userId === userId ? "#ffe283" : "#f3f3f3",
                    }}
                  >
                    {entry ? entry.score : "---"}
                  </p>
                ))}
          </div>
        </div>
      </div>

      <br />

      <div className="leaderboard-points-overlay">
        <h2 className="leaderboard-points-text">
          {pointsAway !== null
            ? `YOU ARE ${pointsAway} PTS AWAY FROM THE NEXT RANK!`
            : "YOU ARE AT THE TOP!"}
        </h2>
      </div>
    </div>
  );
};

export default Leaderboard;
