import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButtons,
  IonBackButton,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Markdown from "marked-react";

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>(); // Get post ID from URL
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase.from("guides").select("*").eq("id", postId).single(); // Fetch the post based on the ID
      if (data) {
        setPost(data);
      } else {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postId]);
  const content = post?.content || "";
  if (!post) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen className="ion-padding">
          <p>Loading post...</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {" "}
          <IonButtons slot="start">
            <IonBackButton defaultHref="#"></IonBackButton>
          </IonButtons>
          <IonTitle>{post.title}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{post.title}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <Markdown>{content}</Markdown>
          </IonCardContent>
        </IonCard>

        {/* Add comments section here in the future */}
        <IonButton expand="full" color="primary">
          Add Comment
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default PostDetail;
