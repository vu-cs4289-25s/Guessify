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
          <h1 className="about-overlay-title">TEAM</h1>
          <div className="about-team-columns">
            <div className="about-team-col-left">
              <h3>Haley Park</h3>
              {/* <br /> */}
              <h3>Joanna Hsieh</h3>
              {/* <br /> */}
              <h3>Jocelyn Ni</h3>
              {/* <br /> */}
              <h3>Winnie Teng</h3>
            </div>
            <div className="about-team-col-right">
              <h3>Graphic Designer</h3>
              {/* <br /> */}
              <h3>Web Developer</h3>
              {/* <br /> */}
              <h3>Project Manager</h3>
              {/* <br /> */}
              <h3>UI / UX Designer</h3>
            </div>
          </div>
        </div>
        {/* Sources panel */}
        <div className="about-overlay-panel">
          <h1 className="about-overlay-title">SOURCES</h1>
          <div className="about-sources">
            <h3>Figma Resources:</h3>
            <ul>
              <li>
                <a href="https://www.figma.com/community/file/1196864707579677521">
                  1,300 Free Pixel Icons
                </a>
              </li>
              <li>
                <a href="https://www.figma.com/community/file/1131802942360219778">
                  Pixel Icons
                </a>
              </li>
              <li>
                <a href="https://www.figma.com/community/file/1327351869279090015">
                  Interactive Text Input
                </a>
              </li>
            </ul>
            <h3>API & Data Sources:</h3>
            <ul>
              <li>
                <a href="https://developer.spotify.com/documentation/web-api/concepts/authorization">
                  Spotify API
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
