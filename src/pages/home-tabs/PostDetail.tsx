import React, { useEffect, useState, useRef } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonButton,
  IonInput,
  IonList,
  IonAvatar,
  useIonToast,
} from "@ionic/react";
import Markdown from "marked-react";
import { useParams } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import { formatDistanceToNow } from "date-fns";

interface Reply {
  id: number;
  content: string;
  created_at: string;
  parent_id: number | null;
  anonymous_id: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  replies?: Reply[];
}

interface PostWithReplies {
  id: number;
  title: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  replies: Reply[];
}

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [postWithReplies, setPostWithReplies] = useState<PostWithReplies | null>(null);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyingToContent, setReplyingToContent] = useState<string | null>(null);
  const [newReplyContent, setNewReplyContent] = useState("");
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presentToast] = useIonToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);

  useEffect(() => {
    let storedAnonymousId = localStorage.getItem("anonymousId");
    if (!storedAnonymousId) {
      storedAnonymousId = crypto.randomUUID();
      localStorage.setItem("anonymousId", storedAnonymousId);
    }
    setAnonymousId(storedAnonymousId);

    const fetchPostAndReplies = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: postData, error: postError } = await supabase
          .from("guides")
          .select("*")
          .eq("id", postId)
          .single();

        const { data: repliesData, error: repliesError } = await supabase
          .from("replies")
          .select("*")
          .eq("guide_id", postId)
          .order("created_at", { ascending: true }); // Fetch all replies in ascending order

        if (postError || repliesError) {
          setError("Failed to load post details and replies.");
        } else if (postData) {
          setPostWithReplies({
            ...postData,
            replies: buildNestedReplies((repliesData as Reply[]) || []),
          });
        }
      } catch (err: any) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndReplies();
  }, [postId]);

  const sanitizeFileName = (name: string) => {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_"); // Keep alphanumeric, dot, underscore, hyphen
  };

  const buildNestedReplies = (replies: Reply[]): Reply[] => {
    const map: Record<number, Reply> = {};
    const roots: Reply[] = [];

    replies.forEach((reply) => {
      map[reply.id] = { ...reply, replies: [] };
    });

    replies.forEach((reply) => {
      if (reply.parent_id !== null && map[reply.parent_id]) {
        map[reply.parent_id].replies!.push(map[reply.id]);
      } else {
        roots.push(map[reply.id]);
      }
    });

    return roots;
  };

  const handleReplyClick = (itemId: number | null, content?: string) => {
    setReplyingToId(itemId);
    setReplyingToContent(content || null);
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setReplyFile(file);
    } else if (file) {
      presentToast({ message: "Invalid image format.", duration: 2000, color: "warning" });
      event.target.value = "";
      setReplyFile(null);
    }
  };

  const handleReplySubmit = async () => {
    if (!newReplyContent.trim() && !replyFile) {
      presentToast({ message: "Reply cannot be empty.", duration: 2000, color: "warning" });
      return;
    }

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let fileType: string | null = null;

    if (replyFile) {
      try {
        const timestamp = new Date().getTime();
        const sanitizedBaseName = sanitizeFileName(
          replyFile.name.substring(0, replyFile.name.lastIndexOf("."))
        ); // Sanitize name without extension
        const fileExtension = replyFile.name.substring(replyFile.name.lastIndexOf("."));
        const fileNameUpload = `${anonymousId}-${sanitizedBaseName}-${timestamp}${fileExtension}`;
        const { data, error: storageError } = await supabase.storage
          .from("reply-images")
          .upload(fileNameUpload, replyFile);

        if (storageError) {
          presentToast({ message: "Failed to upload image.", duration: 2000, color: "danger" });
          return;
        } else {
          fileUrl = supabase.storage.from("reply-images").getPublicUrl(data!.path).data.publicUrl;
          fileName = replyFile.name;
          fileType = replyFile.type;
        }
      } catch (uploadError: any) {
        presentToast({ message: "Failed to upload image.", duration: 2000, color: "danger" });
        return;
      }
    }

    try {
      const { data: newReply, error } = await supabase
        .from("replies")
        .insert([
          {
            content: newReplyContent,
            parent_id: replyingToId,
            guide_id: parseInt(postId, 10),
            anonymous_id: anonymousId,
            file_url: fileUrl,
            file_name: fileName,
            file_type: fileType,
          },
        ])
        .select(
          `
          id,
          content,
          created_at,
          parent_id,
          anonymous_id,
          file_url,
          file_name,
          file_type
        `
        )
        .single();

      if (error) {
        presentToast({ message: "Failed to submit reply.", duration: 2000, color: "danger" });
      } else {
        setNewReplyContent("");
        setReplyFile(null);
        setReplyingToId(null);
        setReplyingToContent(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Optimistically update the UI with the new reply
        setPostWithReplies((prevPost) => {
          if (!prevPost) return null;
          const newReplyWithEmptyReplies: Reply = { ...newReply, replies: [] };

          const updateNestedReplies = (replies: Reply[], newReply: Reply): Reply[] => {
            return replies.map((reply) => {
              if (reply.id === replyingToId) {
                return { ...reply, replies: [...(reply.replies || []), newReply] };
              }
              if (reply.replies) {
                return { ...reply, replies: updateNestedReplies(reply.replies, newReply) };
              }
              return reply;
            });
          };

          if (replyingToId === null || replyingToId === prevPost.id) {
            return {
              ...prevPost,
              replies: [...(prevPost.replies || []), newReplyWithEmptyReplies],
            };
          } else {
            return {
              ...prevPost,
              replies: updateNestedReplies(prevPost.replies, newReplyWithEmptyReplies),
            };
          }
        });
        presentToast({
          message: "Reply submitted successfully!",
          duration: 2000,
          color: "success",
        });
      }
    } catch (error: any) {
      presentToast({ message: "Failed to submit reply.", duration: 2000, color: "danger" });
    }
  };

  const renderReplyItem = (reply: Reply, depth: number = 0) => (
    <div
      key={reply.id}
      style={{
        marginLeft: `${depth * 24}px`, // Increased indent for more visual separation
        paddingLeft: depth > 0 ? "12px" : "0",
        marginBottom: "10px",
        position: "relative", // For positioning pseudo-elements
      }}
    >
      {depth > 0 && (
        <div
          style={{
            position: "absolute",
            top: "8px", // Adjust based on avatar/content alignment
            left: `${depth * 24 - 12}px`, // Adjust for indent and line position
            width: "1px",
            height: "calc(100% - 16px)", // Adjust top/bottom spacing
            backgroundColor: "#fff",
          }}
        />
      )}
      <IonItem
        lines="none"
        style={{
          "--inner-padding-end": "12px",
          "--inner-padding-start": "12px",
          borderRadius: "8px",
          marginBottom: "4px",
          backgroundColor: "#181818", // Black background for reply items
          color: "#fff", // White text for reply items
          marginLeft: depth > 0 ? "12px" : "0", // Offset the item content
        }}
      >
        <IonAvatar slot="start" style={{ width: "36px", height: "36px", marginRight: "10px" }}>
          <img
            src="https://ionicframework.com/docs/img/demos/avatar.svg"
            alt="Anonymous User"
            style={{ borderRadius: "50%", backgroundColor: "#333" }}
          />
        </IonAvatar>
        <IonLabel style={{ margin: "0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "2px",
            }}
          >
            <h3 style={{ fontSize: "0.9em", fontWeight: "bold", margin: "0", color: "#eee" }}>
              Anonymous User
            </h3>
            <p className="reply-metadata" style={{ fontSize: "0.7em", color: "#999", margin: "0" }}>
              {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
            </p>
          </div>
          <div
            className="reply-content"
            style={{ fontSize: "0.85em", lineHeight: "1.4", color: "#ddd" }}
          >
            <div style={{ color: "#ddd" }}>
              <Markdown>{reply.content}</Markdown>
            </div>
            {reply.file_url && (
              <img
                src={reply.file_url}
                alt={reply.file_name || "Reply Image"}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  marginTop: "6px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
                }}
                onClick={() => {}}
              />
            )}
          </div>
        </IonLabel>
        <IonButton
          slot="end"
          size="small"
          onClick={() => handleReplyClick(reply.id, reply.content)}
          style={{
            fontSize: "0.8em",
            "--padding-start": "8px",
            "--padding-end": "8px",
            height: "26px",
            borderRadius: "4px",
            backgroundColor: "var(--ion-color-primary)",
            color: "#fff",
          }}
        >
          Reply
        </IonButton>
      </IonItem>
      {reply.replies && reply.replies.map((childReply) => renderReplyItem(childReply, depth + 1))}
    </div>
  );

  return (
    <IonPage style={{ backgroundColor: "#000", color: "#fff" }}>
      <IonHeader translucent={true}>
        <IonToolbar style={{ backgroundColor: "#121212", color: "#fff" }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" style={{ color: "#fff" }} />
          </IonButtons>
          <IonTitle style={{ fontSize: "1em", color: "#fff" }}>
            {postWithReplies?.title || (loading ? "Loading Post" : "Post")}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent
        className="ion-padding"
        style={{ "--padding-bottom": "120px", backgroundColor: "#000", color: "#fff" }}
      >
        {loading && <p style={{ fontSize: "0.9em", color: "#999" }}>Loading post...</p>}

        {!loading && postWithReplies && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: "#181818",
              borderRadius: "8px",
            }}
          >
            <h2
              style={{ fontSize: "1.1em", fontWeight: "bold", marginBottom: "6px", color: "#eee" }}
            >
              {postWithReplies.title}
            </h2>
            <p
              className="post-metadata"
              style={{ fontSize: "0.8em", color: "#999", marginBottom: "10px" }}
            >
              Posted{" "}
              {formatDistanceToNow(new Date(postWithReplies.created_at), { addSuffix: true })}
            </p>
            <div
              className="post-content"
              style={{ fontSize: "0.9em", lineHeight: "1.5", color: "#ddd" }}
            >
              <div style={{ color: "#ddd" }}>
                <Markdown>{postWithReplies.content}</Markdown>
              </div>
            </div>
            {postWithReplies.image_url && (
              <img
                src={postWithReplies.image_url}
                alt="Post Image"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  marginTop: "10px",
                  borderRadius: "6px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
                }}
              />
            )}
            <div style={{ borderBottom: "1px solid #333", margin: "14px 0" }} />
          </div>
        )}

        {!loading && postWithReplies && postWithReplies.replies.length > 0 && (
          <h3 style={{ fontSize: "1em", fontWeight: "bold", marginBottom: "10px", color: "#eee" }}>
            Replies
          </h3>
        )}
        <IonList lines="none" style={{ backgroundColor: "transparent" }}>
          {" "}
          {/* Make the IonList background transparent */}
          {!loading &&
            postWithReplies &&
            postWithReplies.replies.map((reply) => renderReplyItem(reply))}
        </IonList>

        {!loading && postWithReplies && (
          <div
            style={{
              marginTop: "20px",
              paddingTop: "12px",
              backgroundColor: "#181818",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            {replyingToId && replyingToContent && (
              <div
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  borderLeft: "3px solid var(--ion-color-primary)",
                  backgroundColor: "#222",
                  borderRadius: "4px",
                  fontSize: "0.8em",
                  color: "#ddd",
                }}
              >
                Replying to: "
                {replyingToContent.length > 50
                  ? replyingToContent.substring(0, 50) + "..."
                  : replyingToContent}
                "
              </div>
            )}
            <IonItem
              lines="none"
              style={{
                "--inner-padding-end": "12px",
                "--inner-padding-start": "12px",
                marginBottom: "6px",
                borderRadius: "6px",
                backgroundColor: "#222",
                color: "#fff",
              }}
            >
              <IonLabel
                position="stacked"
                style={{ fontSize: "0.9em", color: "#eee", marginBottom: "4px" }}
              >
                Reply
              </IonLabel>
              <IonInput
                value={newReplyContent}
                onIonChange={(e) => setNewReplyContent(e.detail!.value!)}
                autoFocus={replyingToId !== null}
                style={{
                  fontSize: "0.85em",
                  borderRadius: "6px",
                  border: "1px solid #333",
                  padding: "8px",
                  backgroundColor: "#333",
                  color: "#fff",
                }}
              />
            </IonItem>
            <IonItem
              lines="none"
              style={{
                "--inner-padding-end": "12px",
                "--inner-padding-start": "12px",
                marginTop: "6px",
                marginBottom: "10px",
                borderRadius: "6px",
                backgroundColor: "#222",
                color: "#fff",
              }}
            >
              <IonLabel
                position="stacked"
                style={{ fontSize: "0.9em", color: "#eee", marginBottom: "4px" }}
              >
                Attach Image (Optional)
              </IonLabel>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ fontSize: "0.85em", color: "#fff" }}
              />
              {replyFile && (
                <IonLabel style={{ fontSize: "0.8em", marginTop: "4px", color: "#999" }}>
                  Selected: {replyFile.name}
                </IonLabel>
              )}
            </IonItem>
            <IonButton
              expand="block"
              onClick={handleReplySubmit}
              disabled={!newReplyContent.trim() && !replyFile}
              style={{
                marginTop: "12px",
                fontSize: "0.9em",
                borderRadius: "6px",
                height: "36px",
                backgroundColor: "var(--ion-color-primary)",
                color: "#fff",
              }}
            >
              {replyingToId !== null ? "Reply" : "Post"}
            </IonButton>
            {replyingToId !== null && (
              <IonButton
                fill="clear"
                onClick={() => {
                  setReplyingToId(null);
                  setReplyingToContent(null);
                }}
                style={{ fontSize: "0.8em", marginTop: "10px", color: "#999" }}
              >
                Cancel Reply
              </IonButton>
            )}
          </div>
        )}

        {error && !loading && (
          <p
            className="error-message"
            style={{ fontSize: "0.9em", color: "var(--ion-color-danger)" }}
          >
            {error}
          </p>
        )}

        {!postWithReplies && !loading && !error && (
          <p style={{ fontSize: "0.9em", color: "#999" }}>Post not found.</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PostDetail;
