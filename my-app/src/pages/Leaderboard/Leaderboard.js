import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./Leaderboard.css";

const Leaderboard = () => {
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
              <img
                src="/LeaderboardIcons/first_leaderboard_medals.png" // TODO - import icon
                alt="1"
                className="rank-one-icon"
              />
            </p>
            <p>
              <img
                src="/LeaderboardIcons/second_leaderboard_medals.png" // TODO - import icon
                alt="2"
                className="rank-two-icon"
              />
            </p>
            <p>
              <img
                src="/LeaderboardIcons/third_leaderboard_medals.png" // TODO - import icon
                alt="3"
                className="rank-three-icon"
              />
            </p>
            <p>4</p>
            <p>5</p>
          </div>
          <div className="leaderboard-col-mid">
            <p className="leaderboard-col-title">NAME</p>
            <br />
            {/* TODO - fetch name in order of highest score */}
            {/* TODO - yellow text for current user*/}
          </div>
          <div className="leaderboard-col-right">
            <p className="leaderboard-col-title">SCORE</p>
            <br />
            {/* TODO - fetch score in order of highest score */}
            {/* TODO - yellow text for current user*/}
          </div>
        </div>
      </div>

      <br />

      <div className="leaderboard-points-overlay">
        {/* TODO - insert points */}
        <h2 className="leaderboard-points-text">
          YOU ARE --- PTS AWAY FROM THE NEXT RANK!
        </h2>
      </div>
    </div>
  );
};

export default Leaderboard;
