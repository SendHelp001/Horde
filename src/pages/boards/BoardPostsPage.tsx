import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  useIonViewDidEnter,
} from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import { transitionFade } from "../../animations/transition";

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
  created_at: string;
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

  useEffect(() => {
    const fetchBoardAndPosts = async () => {
      setLoading(true);

      // Fetch the board by slug
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
        .select("id, title, created_at")
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

    fetchBoardAndPosts();
  }, [slug]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{board ? `${board.name}` : "Board"}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent ref={contentRef} fullscreen className="ion-padding">
        {loading ? (
          <p>Loading posts...</p>
        ) : board === null ? (
          <p>Board not found.</p>
        ) : posts.length === 0 ? (
          <p>No posts found for this board.</p>
        ) : (
          <IonList>
            {posts.map((post) => (
              <IonItem
                key={post.id}
                routerLink={`/horde/app/post/${post.id}`}
                detail
              >
                <IonLabel>
                  <h2>{post.title}</h2>
                  <p>{new Date(post.created_at).toLocaleString()}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default BoardPostsPage;
