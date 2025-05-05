import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonAvatar,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useHistory } from "react-router-dom";
import Loader from "../components/Loader";
import FeedCard from "../components/FeedCard"; // Import the new component
import "./Home.css";

const Home: React.FC = () => {
  const [posts, setPosts] = useState<{ id: string; title: string; content: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase.from("guides").select("*");
      if (data) {
        setPosts(data);
      } else {
        console.error("Error fetching posts:", error);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const handlePostClick = (postId: string) => {
    history.push(`/post/${postId}`);
  };

  return (
    <IonPage>
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

        <IonToolbar>
          <IonSegment value="all" className="sleek-segment">
            <IonSegmentButton value="all" className="no-pulse">
              <IonLabel>For you</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="following" className="no-pulse">
              <IonLabel>Following</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <Loader />
          </div>
        ) : (
          posts.map((post) => (
            <FeedCard
              key={post.id}
              id={post.id}
              title={post.title}
              content={post.content}
              onClick={handlePostClick}
              username="John Doe"
              timestamp="2h ago"
              avatarUrl="https://ionicframework.com/docs/img/demos/avatar.svg"
            />
          ))
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
