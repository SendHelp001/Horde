import React from "react";
import { IonAvatar } from "@ionic/react";
import ActionButton from "./ActionButton";
import "./FeedCard.css";

interface FeedCardProps {
  id: string;
  title: string;
  content: string;
  onClick: (id: string) => void;
  username: string;
  timestamp: string;
  avatarUrl: string;
}

const FeedCard: React.FC<FeedCardProps> = ({
  id,
  title,
  content,
  onClick,
  username,
  timestamp,
  avatarUrl,
}) => {
  // Example counts for actions
  const commentCount = 57;
  const shareCount = 18;
  const likeCount = 873;
  const pinCount = 73000;

  return (
    <div className="feed-card" onClick={() => onClick(id)}>
      <IonAvatar className="feed-avatar">
        <img src={avatarUrl} alt="avatar" />
      </IonAvatar>
      <div className="feed-content">
        <div className="feed-header">
          <span className="feed-username">{username}</span>
          <span className="feed-timestamp">· {timestamp}</span>
        </div>
        <div className="feed-text">{content}</div>
        <div className="feed-actions">
          <ActionButton
            icon="comment"
            label="Comment"
            count={commentCount}
            onClick={() => console.log("Comment clicked")}
          />
          <ActionButton
            icon="share"
            label="Share"
            count={shareCount}
            onClick={() => console.log("Share clicked")}
          />
          <ActionButton
            icon="favorite"
            label="Like"
            count={likeCount}
            onClick={() => console.log("Like clicked")}
          />
          <ActionButton
            icon="push_pin"
            label="Pin"
            count={pinCount}
            onClick={() => console.log("Pin clicked")}
          />
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
