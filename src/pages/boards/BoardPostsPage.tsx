import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  useIonViewDidEnter,
} from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import { transitionFade } from "../../animations/transition";
import FeedCard from "../../components/FeedCard"; // Adjust the path as necessary
import { format } from "date-fns";

interface RouteParams {
  slug: string;
}

interface Board {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

interface Guide {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  image_alt: string | null;
  created_at: string;
  image_aspect_ratio?: "16-9" | "4-3" | "1-1";
}

const BoardPostsPage: React.FC = () => {
  const { slug } = useParams<RouteParams>();
  const [board, setBoard] = useState<Board | null>(null);
  const [posts, setPosts] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLIonContentElement | null>(null);

  useIonViewDidEnter(() => {
    if (contentRef.current) {
      transitionFade(contentRef.current, "in");
    }
  });

  const fetchBoardAndPosts = async () => {
    setLoading(true);

    const { data: boardData, error: boardError } = await supabase
      .from("boards")
      .select("id, name, slug, description")
      .eq("slug", slug)
      .single();

    if (boardError || !boardData) {
      console.error("Board not found:", boardError);
      setBoard(null);
      setPosts([]);
      setLoading(false);
      return;
    }

    setBoard(boardData);

    // Fetch the posts linked to the board
    const { data: postsData, error: postsError } = await supabase
      .from("guides")
      .select("id, title, content, image_url, image_alt, created_at")
      .eq("board_id", boardData.id)
      .order("created_at", { ascending: false });

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      setPosts([]);
    } else {
      setPosts(postsData || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBoardAndPosts();
  }, [slug]);

  const handleRefresh = (event: CustomEvent) => {
    fetchBoardAndPosts().then(() => event.detail.complete());
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      return format(new Date(timestamp), "yyyy-MM-dd HH:mm:ss");
    } catch {
      return "Just now";
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{board ? board.name : "Board"}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent ref={contentRef} fullscreen className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {loading ? (
          <p>Loading posts...</p>
        ) : board === null ? (
          <p>Board not found.</p>
        ) : posts.length === 0 ? (
          <p>No posts found for this board.</p>
        ) : (
          <>
            {posts.map((post) => (
              <div key={post.id} className="feed-item">
                <FeedCard
                  id={post.id}
                  title={post.title}
                  content={post.content || ""}
                  onClick={() => (window.location.href = `/horde/app/post/${post.id}`)}
                  username="Anonymous"
                  timestamp={formatTimestamp(post.created_at)}
                  avatarUrl="https://ionicframework.com/docs/img/demos/avatar.svg"
                  imageUrl={post.image_url}
                  imageAlt={post.image_alt}
                  imageAspectRatio={post.image_aspect_ratio}
                  board={board ? { ...board } : undefined}
                />
              </div>
            ))}
            <div style={{ paddingBottom: "120px" }}></div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default BoardPostsPage;
