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
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns"; // Import the format function from date-fns
import { supabase } from "../utils/supabaseClient";
import { useHistory } from "react-router-dom";
import Loader from "./Loader";
import FeedCard from "./FeedCard";
import "./FeedContainer.css";
import devil from "../assets/devil.png"; // Adjust the path as necessary

interface Guide {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  image_alt: string | null;
  created_at: string;
  user_id?: number | null;
  image_name: string | null;
  image_type: string | null;
  board_id: number | null;
  image_aspect_ratio?: "16-9" | "4-3" | "1-1"; // Optional field in your data
  board: {
    id: number;
    name: string;
    slug: string;
    description: string;
  } | null;
}

const FeedContainer: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0); // Start with page 0
  const [fetchError, setFetchError] = useState(false);
  const history = useHistory();
  const guidesPerPage = 10; // Adjust as needed

  const fetchGuides = useCallback(
    async (reload = false, event?: any) => {
      if (loading || (!hasMore && !reload) || fetchError) {
        if (event) {
          event.target.complete();
        }
        return;
      }
      setLoading(true);

      if (reload) {
        setPage(0);
        setGuides([]);
        setHasMore(true);
        setFetchError(false);
      }

      const start = reload ? 0 : page * guidesPerPage;
      const end = start + guidesPerPage - 1;

      const { data, error } = await supabase.rpc("get_guides_with_boards", {
        p_from: start,
        p_to: end,
      });

      if (error) {
        console.error("Error fetching guides:", error);
        setFetchError(true);
        if (event) {
          event.target.complete();
        }
        setLoading(false);
        return;
      }

      if (data) {
        const mappedGuides: Guide[] = data.map((guide: any) => ({
          ...guide,
          board: guide.board_data,
        }));

        setGuides((prevGuides) => {
          const newGuides = mappedGuides.filter(
            (newGuide) => !prevGuides.some((g) => g.id === newGuide.id)
          );
          return reload ? newGuides : [...prevGuides, ...newGuides];
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
    [hasMore, loading, page, fetchError]
  );

  useEffect(() => {
    if (guides.length === 0 && !fetchError) {
      fetchGuides(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchGuides, guides.length, fetchError]);

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

  const handleRefresh = (event: CustomEvent<any>) => {
    if (!fetchError) {
      fetchGuides(true, event);
    } else {
      event.detail.complete();
    }
  };

  return (
    <>
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent />
      </IonRefresher>

      {guides.map((guide, index) => (
        <div key={guide.id} className="feed-item">
          <FeedCard
            id={guide.id}
            title={guide.title}
            content={guide.content}
            onClick={handleGuideClick}
            username="Anonymous"
            timestamp={formatTimestamp(guide.created_at)}
            avatarUrl="https://ionicframework.com/docs/img/demos/avatar.svg"
            imageUrl={guide.image_url}
            imageAlt={guide.image_alt}
            imageAspectRatio={guide.image_aspect_ratio}
            board={guide.board || undefined}
          />
          {/* {index < guides.length - 1 && <IonItemDivider className="feed-divider" />} */}
        </div>
      ))}

      <IonInfiniteScroll
        threshold="100px"
        disabled={!hasMore}
        onIonInfinite={(event) => fetchGuides(false, event)}
      >
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
    </>
  );
};

export default FeedContainer;
