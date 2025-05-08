import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonAvatar,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonImg, // Import IonImg for displaying images
  IonItemDivider, // Import IonItemDivider
} from "@ionic/react";
import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns"; // Import the format function from date-fns
import { supabase } from "../utils/supabaseClient";
import { useHistory } from "react-router-dom";
import Loader from "./Loader";
import FeedCard from "./FeedCard";
import "./FeedContainer.css";
import devil from "/assets/devil.png"; // Adjust the path as necessary

interface Guide {
  id: string;
  title: string;
  content: string;
  image_url: string | null; // Add the image_url field
  image_alt: string | null; // Optional: for alt text
  created_at: string; // Assuming you might want to display this
  user_id: string | null; // If you have user information
  image_aspect_ratio?: "16-9" | "4-3" | "1-1"; // Optional field in your data
}

const Home: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0); // Start with page 0
  const history = useHistory();
  const guidesPerPage = 10; // Adjust as needed

  const fetchGuides = useCallback(
    async (event?: any) => {
      if (loading || !hasMore) {
        if (event) {
          event.target.complete();
        }
        return;
      }
      setLoading(true);

      const start = page * guidesPerPage;
      const end = (page + 1) * guidesPerPage - 1;

      const { data, error } = await supabase
        .from("guides")
        .select("*") // Fetch all columns, including image_url
        .range(start, end)
        .order("created_at", { ascending: false }); // Order by creation date, newest first

      if (error) {
        console.error("Error fetching guides:", error);
        if (event) {
          event.target.complete();
        }
        setLoading(false);
        return;
      }

      if (data) {
        setGuides((prevGuides) => {
          const newGuides = data.filter(
            (newGuide) => !prevGuides.some((existingGuide) => existingGuide.id === newGuide.id)
          );
          return [...prevGuides, ...newGuides];
        });
        if (data.length < guidesPerPage) {
          setHasMore(false);
        } else {
          setPage((prevPage) => prevPage + 1);
        }
      }

      if (event) {
        event.target.complete();
      }
      setLoading(false);
    },
    [hasMore, loading, page, guidesPerPage]
  );

  useEffect(() => {
    if (guides.length === 0) {
      fetchGuides();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchGuides, guides.length]);

  const handleGuideClick = (guideId: string) => {
    history.push(`/horde/app/post/${guideId}`);
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      return format(new Date(timestamp), "yyyy-MM-dd HH:mm:ss"); // Customize the format as needed
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Just now"; // Fallback if formatting fails
    }
  };

  return (
    <IonPage role="feed">
      <IonHeader>
        <IonToolbar>
          <div className="toolbar-container">
            <IonButton
              fill="clear"
              onClick={() => history.push("/profile")}
              className="avatar-button"
            >
              <IonAvatar slot="icon-only" className="custom-avatar">
                <img
                  alt="Silhouette of a person's head"
                  src="https://ionicframework.com/docs/img/demos/avatar.svg"
                />
              </IonAvatar>
            </IonButton>
            <img src="/homeIcon.png" alt="Home Icon" className="home-icon-png" />
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {guides.map((guide, index) => (
          <div key={guide.id} className="feed-item">
            <FeedCard
              id={guide.id}
              title={guide.title}
              content={guide.content}
              onClick={handleGuideClick}
              username="Anonymous" // You can fetch user info if available
              timestamp={formatTimestamp(guide.created_at)} // Format the timestamp
              avatarUrl="https://ionicframework.com/docs/img/demos/avatar.svg" // Default avatar
              imageUrl={guide.image_url} // Pass the image URL
              imageAlt={guide.image_alt} // Pass the image alt text
              imageAspectRatio={guide.image_aspect_ratio}
            />
            {/* {index < guides.length - 1 && <IonItemDivider className="feed-divider" />} */}
          </div>
        ))}

        <IonInfiniteScroll threshold="100px" disabled={!hasMore} onIonInfinite={fetchGuides}>
          <IonInfiniteScrollContent
            loadingSpinner="bubbles"
            loadingText="Loading more guides..."
          ></IonInfiniteScrollContent>
        </IonInfiniteScroll>

        {!hasMore && (
          <div
            style={{
              textAlign: "center",
              color: "#dc3545",
              borderRadius: "15px",
              border: "1px solid #dc3545",
              backgroundColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              marginBottom: "60px",
              fontSize: "0.9rem",
              padding: "6px 10px",
              alignSelf: "center",
            }}
          >
            <span>End of Doom</span>
            <img src={devil} alt="Logo" style={{ width: "18px", height: "18px" }} />
          </div>
        )}

        {/* Padding for the bottom navigation bar */}
        <div style={{ paddingBottom: "60px" }}></div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
