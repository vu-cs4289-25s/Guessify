import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <Navbar />
      <div className="about-overlays-wrapper">
        {/* Team panel */}
        <div className="about-overlay-panel about-team-panel">
          <h2 className="about-overlay-title">TEAM</h2>
          <div className="about-team-columns">
            <div className="about-team-col-left">
              <p>Haley Park</p>
              <br />
              <p>Joanna Hsieh</p>
              <br />
              <p>Jocelyn Ni</p>
              <br />
              <p>Winnie Teng</p>
            </div>
            <div className="about-team-col-right">
              <p>Graphic Designer</p>
              <br />
              <p>Web Developer</p>
              <br />
              <p>Project Manager</p>
              <br />
              <p>UI / UX Designer</p>
            </div>
          </div>
        </div>
        {/* Sources panel */}
        <div className="about-overlay-panel about-sources-panel">
          <h2 className="about-overlay-title">SOURCES</h2>
          <div className="about-sources">
            <p>1,300 Free Pixel Icons</p>
            <p>Pixel Icons</p>
            <p>Spotify API</p>
            <p>More External Sources</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
