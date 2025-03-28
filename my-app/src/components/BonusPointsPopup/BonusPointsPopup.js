// BonusPointsPopup.js
import React, { useEffect, useState } from "react";
import "./BonusPointsPopup.css";

const BonusPointsPopup = ({ points, onRemove }) => {
  const [position, setPosition] = useState({ top: "50%", left: "50%" });

  useEffect(() => {
    // Generate random positions within a safe range
    const randomTop = Math.random() * 40 + 10; // 10% to 50% (upper half only)
    // Generate random horizontal position: either 20% to 40% OR 60% to 80%
    let randomLeft;
    if (Math.random() < 0.5) {
      randomLeft = Math.random() * 15 + 20; // 20% to 35% (left side)
    } else {
      randomLeft = Math.random() * 15 + 65; // 65% to 80% (right side)
    }
    setPosition({ top: `${randomTop}%`, left: `${randomLeft}%` });

    // Automatically remove the popup after 5 seconds
    const timer = setTimeout(() => {
      onRemove();
    }, 8000); // Extended duration to 8 seconds

    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <div className="bonus-points-popup" style={position}>
      <p>Bonus Points!</p>
      <p className="bonus-points">+{points}</p>
    </div>
  );
};

export default BonusPointsPopup;
