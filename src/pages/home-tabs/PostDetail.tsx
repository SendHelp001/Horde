import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonBackButton,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import Markdown from "marked-react";
import Loader from "../../components/Loader";

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase.from("guides").select("*").eq("id", postId).single();
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
            <IonButtons slot="start">
              <IonBackButton defaultHref="#"></IonBackButton>
            </IonButtons>
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen className="ion-padding">
          <Loader /> {/* Show loader */}
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>
          <IonTitle>{post.title}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div
          style={{
            borderBottom: "1px solid var(--ion-color-step-150, #ccc)",
            paddingBottom: "12px",
            marginBottom: "20px",
          }}
        >
          {/* Title */}
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              marginBottom: "8px",
              color: "var(--ion-text-color, #000)",
            }}
          >
            {post.title}
          </h2>

          {/* Metadata (you can later add author/timestamp here) */}
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--ion-color-medium, #666)",
              marginBottom: "8px",
            }}
          >
            Post ID: {post.id}
          </p>

          {/* Content (Markdown Rendered) */}
          <div
            style={{
              fontSize: "1rem",
              lineHeight: "0",
              color: "var(--ion-text-color, #111)",
            }}
            className="markdown-body"
          >
            <Markdown>{content}</Markdown>
          </div>
        </div>

        {/* Simulated reply button (like tweet comment) */}
        <IonButton expand="block" fill="outline" color="primary" style={{ borderRadius: "20px" }}>
          Add Comment
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default PostDetail;
