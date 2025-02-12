import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <Navbar />
      <div className="about-overlays-wrapper">
        {/* Team panel */}
        <div className="about-overlay-panel">
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
        <div className="about-overlay-panel">
          <h2 className="about-overlay-title">SOURCES</h2>
          <div className="about-sources">
            <p>Figma Resources:</p>
            <ul>
              <li>
                <a href="https://www.figma.com/community/file/1196864707579677521">1,300 Free Pixel Icons</a>
              </li>
              <li>
                <a href="https://www.figma.com/community/file/1131802942360219778">Pixel Icons</a>
              </li>
              <li>
                <a href="https://www.figma.com/community/file/1327351869279090015">Interactive Text Input</a>
              </li>
            </ul>
            <p>API & Data Sources:</p>
            <ul>
              <li>
                <a href="https://developer.spotify.com/documentation/web-api/concepts/authorization">Spotify API</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
