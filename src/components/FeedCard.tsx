import React from "react";
import { IonAvatar, IonIcon, IonButton } from "@ionic/react";
import "./FeedCard.css";
import { repeatOutline } from "ionicons/icons";

interface FeedCardProps {
  id: string;
  title: string;
  content: string;
  onClick: (id: string) => void;
  username: string;
  timestamp: string;
  avatarUrl: string;
  imageUrl: string | null;
  imageAlt: string | null;
  imageAspectRatio?: "16-9" | "4-3" | "1-1";
}

const FeedCard: React.FC<FeedCardProps> = ({
  id,
  title,
  content,
  onClick,
  username,
  timestamp,
  avatarUrl,
  imageUrl,
  imageAlt,
  imageAspectRatio = "16-9",
}) => {
  const imageContainerClass = imageUrl
    ? `feed-image-container aspect-ratio-${imageAspectRatio}`
    : "";

  return (
    <div className="feed-card" onClick={() => onClick(id)}>
      <div className="feed-header-avatar">
        <IonAvatar className="feed-avatar">
          <img src={avatarUrl} alt="avatar" />
        </IonAvatar>
        <div className="feed-header-info">
          <span className="feed-username">{username}</span>
          <span className="feed-timestamp">· {timestamp}</span>
        </div>
      </div>
      <div className="feed-content">
        <div className="feed-text">{content}</div>
        {imageUrl && (
          <div className={imageContainerClass}>
            <img
              src={imageUrl}
              alt={imageAlt || title}
              className="feed-image"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              onError={(event) => {
                console.error("Error loading image:", event.currentTarget.src);
              }}
            />
          </div>
        )}
        <div className="feed-actions">
          <IonButton fill="clear" onClick={() => console.log(`Reply to post ${id}`)}>
            <IonIcon icon={repeatOutline} slot="icon-only" aria-label="Reply" />
            Reply
          </IonButton>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
