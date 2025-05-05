import React, { useState } from "react";
import "./ActionButton.css";

interface ActionButtonProps {
  icon: string;
  label: string;
  count: number;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, count, onClick }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300); // Reset animation after 300ms
    onClick();
  };

  return (
    <span className={`action-button ${isClicked ? "clicked" : ""}`} onClick={handleClick}>
      <span className="action-icon material-icons">{icon}</span>
      {label} {count}
    </span>
  );
};

export default ActionButton;
