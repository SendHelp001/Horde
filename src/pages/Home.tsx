import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useHistory } from "react-router-dom";

const Home: React.FC = () => {
  const [posts, setPosts] = useState<{ id: string; title: string; content: string }[]>([]);
  const history = useHistory();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase.from("guides").select("*");
      if (data) {
        setPosts(data);
      } else {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const handlePostClick = (postId: string) => {
    history.push(`/post/${postId}`); // Navigate to the post detail page
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {posts.map((post: any) => (
          <IonCard key={post.id} button onClick={() => handlePostClick(post.id)}>
            <IonCardHeader>
              <IonCardTitle>{post.title}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>{post.content.substring(0, 100)}...</p> {/* Show content preview */}
            </IonCardContent>
          </IonCard>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default Home;
