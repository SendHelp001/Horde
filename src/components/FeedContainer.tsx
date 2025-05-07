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
} from "@ionic/react";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { useHistory } from "react-router-dom";
import Loader from "./Loader";
import FeedCard from "./FeedCard";
import "./FeedContainer.css";

const Home: React.FC = () => {
  const [posts, setPosts] = useState<{ id: string; title: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0); // Start with page 0
  const history = useHistory();
  const postsPerPage = 10; // Adjust as needed

  const fetchPosts = useCallback(
    async (event?: any) => {
      if (loading || !hasMore) {
        if (event) {
          event.target.complete();
        }
        return;
      }
      setLoading(true);

      const start = page * postsPerPage;
      const end = (page + 1) * postsPerPage - 1;

      const { data, error } = await supabase.from("guides").select("*").range(start, end);

      if (error) {
        console.error("Error fetching posts:", error);
        if (event) {
          event.target.complete();
        }
        setLoading(false);
        return;
      }

      if (data) {
        setPosts((prevPosts) => {
          // Ensure no duplicates by checking if the new posts already exist
          const newPosts = data.filter(
            (newPost) => !prevPosts.some((existingPost) => existingPost.id === newPost.id)
          );
          return [...prevPosts, ...newPosts];
        });
        if (data.length < postsPerPage) {
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
    [hasMore, loading, page, postsPerPage]
  );

  useEffect(() => {
    // Initial fetch only if no posts are loaded yet
    if (posts.length === 0) {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPosts, posts.length]);

  const handlePostClick = (postId: string) => {
    history.push(`/horde/app/post/${postId}`);
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
        {posts.map((post) => (
          <FeedCard
            key={post.id}
            id={post.id}
            title={post.title}
            content={post.content}
            onClick={handlePostClick}
            username="Anonymous"
            timestamp="2h ago"
            avatarUrl="https://ionicframework.com/docs/img/demos/avatar.svg"
          />
        ))}

        <IonInfiniteScroll threshold="100px" disabled={!hasMore} onIonInfinite={fetchPosts}>
          <IonInfiniteScrollContent
            loadingSpinner="bubbles"
            loadingText="Loading more posts..."
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
              display: "flex", // Use flex to center content
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              marginBottom: "60px",
              fontSize: "0.9rem",
              padding: "6px 10px", // Adjust padding for better visual
              alignSelf: "center", // Center the div itself
            }}
          >
            <span>End of Doom</span>
            <img
              src={"src/assets/devil.png"}
              alt="Devil Icon"
              style={{ width: "18px", height: "18px" }}
            />
          </div>
        )}

        {/* Padding for the bottom navigation bar */}
        <div style={{ paddingBottom: "60px" }}></div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
