import React from "react";
import { IonAvatar, IonIcon, IonButton, IonChip } from "@ionic/react";
import "./FeedCard.css";
import { repeatOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom"; // Import useHistory

interface FeedCardProps {
  id: string;
  title: string;
  content: string;
  onClick: (id: string, slug?: string) => void; // Update onClick type to accept slug
  username: string;
  timestamp: string;
  avatarUrl: string;
  imageUrl: string | null;
  imageAlt: string | null;
  imageAspectRatio?: "16-9" | "4-3" | "1-1";
  board?: {
    id: number;
    name: string;
    slug: string;
  };
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
  board,
}) => {
  const imageContainerClass = imageUrl
    ? `feed-image-container aspect-ratio-${imageAspectRatio}`
    : "";
  const history = useHistory(); // Initialize history

  const handleBoardClick = (e: React.MouseEvent, slug: string) => {
    e.stopPropagation(); // Prevent the FeedCard's onClick
    history.push(`/horde/app/board/${slug}`);
  };

  return (
    <div className="feed-card" onClick={() => onClick(id, board?.slug)}>
      <div className="feed-header">
        <div className="feed-header-avatar">
          <IonAvatar className="feed-avatar">
            <img src={avatarUrl} alt="avatar" />
          </IonAvatar>
          <div className="feed-header-info">
            <span className="feed-username">{username}</span>
            <span className="feed-timestamp">· {timestamp}</span>
          </div>
        </div>
        {board?.slug && board?.name && (
          <div className="feed-board-tag">
            From the
            <IonChip color="secondary" outline style={{ marginTop: "0px" }}>
              /{board.slug}
            </IonChip>
            <a
              href={`/horde/app/board/${board.slug}`}
              onClick={(e) => handleBoardClick(e, board.slug)}
              style={{
                color: "#4EA1FF",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              {board.name}
            </a>{" "}
            board
          </div>
        )}
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
