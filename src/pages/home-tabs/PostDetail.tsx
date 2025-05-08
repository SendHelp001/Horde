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
  IonChip,
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
  board_slug?: string | null;
  replies: Reply[];
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [postWithReplies, setPostWithReplies] = useState<PostWithReplies | null>(null);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyingToContent, setReplyingToContent] = useState<string | null>(null);
  const [newReplyContent, setNewReplyContent] = useState("");
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [replyFileName, setReplyFileName] = useState<string | null>(null);
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
          .select(
            `
        *,
        boards (
          slug
        )
      `
          )
          .eq("id", postId)
          .single();

        const { data: repliesData, error: repliesError } = await supabase
          .from("replies")
          .select("*")
          .eq("guide_id", postId)
          .order("created_at", { ascending: true });

        if (postError || repliesError) {
          setError("Failed to load post details and replies.");
        } else if (postData) {
          const boardSlug = postData.boards?.slug || null;

          setPostWithReplies({
            ...postData,
            board_slug: boardSlug,
            replies: buildNestedReplies((repliesData || []) as Reply[]),
          });
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndReplies();
  }, [postId]);

  const sanitizeFileName = (name: string) => {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_");
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
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        presentToast({
          message: `Image size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.`,
          duration: 2000,
          color: "warning",
        });
        event.target.value = "";
        setReplyFile(null);
        setReplyFileName(null);
        return;
      }
      if (file.type.startsWith("image/")) {
        setReplyFile(file);
        setReplyFileName(file.name);
      } else {
        presentToast({ message: "Please select an image file.", duration: 2000, color: "warning" });
        event.target.value = "";
        setReplyFile(null);
        setReplyFileName(null);
      }
    } else {
      setReplyFile(null);
      setReplyFileName(null);
    }
  };

  const uploadFileToReplyImages = async (file: File | null) => {
    if (!file) return { data: null, error: null };

    try {
      const now = new Date();
      const timestamp = now.toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
      const fileExtension = file.name.substring(file.name.lastIndexOf("."));
      const sanitizedFileName = sanitizeFileName(file.name.split(".")[0]);
      const newFileName = `${sanitizedFileName}_${timestamp}${fileExtension}`;
      const filePath = `replies/${postId}/${newFileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("reply-images")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return { error: uploadError };
      }

      const publicUrl =
        supabase.storage.from("reply-images").getPublicUrl(filePath).data?.publicUrl || null;

      return { data: { path: filePath, publicUrl, name: file.name, type: file.type } };
    } catch (error: any) {
      console.error("Error during image upload:", error);
      return { error: { message: error.message } };
    }
  };

  const handleReplySubmit = async () => {
    if (!newReplyContent.trim() && !replyFile) {
      presentToast({
        message: "Please enter a reply or attach an image.",
        duration: 2000,
        color: "warning",
      });
      return;
    }

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let fileType: string | null = null;

    if (replyFile) {
      const uploadResult = await uploadFileToReplyImages(replyFile);

      if (uploadResult.error) {
        console.error("Error uploading image:", uploadResult.error);
        presentToast({ message: "Failed to upload image.", duration: 2000, color: "danger" });
        return;
      }

      fileUrl = uploadResult.data?.publicUrl || null;
      fileName = uploadResult.data?.name || null;
      fileType = uploadResult.data?.type || null;
    }

    try {
      const { error: insertError } = await supabase.from("replies").insert([
        {
          content: newReplyContent.trim(),
          parent_id: replyingToId,
          guide_id: parseInt(postId, 10),
          anonymous_id: anonymousId,
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
        },
      ]);

      if (insertError) {
        console.error("Error creating reply:", insertError);
        presentToast({ message: "Failed to post reply.", duration: 2000, color: "danger" });
      } else {
        setNewReplyContent("");
        setReplyingToId(null);
        setReplyingToContent(null);
        setReplyFile(null);
        setReplyFileName(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        presentToast({ message: "Reply posted!", duration: 2000, color: "success" });
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
              .order("created_at", { ascending: true });

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
      }
    } catch (err: any) {
      console.error("An unexpected error occurred while posting reply:", err);
      presentToast({
        message: "An unexpected error occurred while posting reply.",
        duration: 2000,
        color: "danger",
      });
    }
  };

  const renderReplyItem = (reply: Reply, depth: number = 0) => {
    const isReplyingToThis = replyingToId === reply.id;
    return (
      <div
        key={reply.id}
        style={{
          marginLeft: `${depth * 12}px`,
          paddingLeft: depth > 0 ? "8px" : "0",
          marginBottom: "6px",
          borderLeft: depth > 0 ? `1px solid #222` : "none",
        }}
      >
        <IonItem
          lines="none"
          style={{
            "--inner-padding-end": "10px",
            "--inner-padding-start": "10px",
            borderRadius: "6px",
            marginBottom: "4px",
            backgroundColor: isReplyingToThis ? "#333" : "#1e1e1e",
            color: "#f0f0f0",
          }}
        >
          <IonAvatar slot="start" style={{ width: "24px", height: "24px", marginRight: "8px" }}>
            <img
              src="https://ionicframework.com/docs/img/demos/avatar.svg"
              alt="Anonymous User"
              style={{ borderRadius: "50%", backgroundColor: "#444" }}
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
              <h3 style={{ fontSize: "0.8em", margin: 0, fontWeight: 500, color: "#eee" }}>
                Anonymous
              </h3>
              <p style={{ fontSize: "0.7em", margin: 0, color: "#777" }}>
                {" "}
                {}
                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
              </p>
            </div>
            <div
              className="reply-content"
              style={{ fontSize: "0.8em", lineHeight: "1.4", color: "#ddd" }}
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
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.4)",
                    cursor: "pointer",
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
              fontSize: "0.7em",
              "--padding-start": "8px",
              "--padding-end": "8px",
              height: "24px",
              borderRadius: "4px",
              backgroundColor: "var(--ion-color-primary)",
              color: "#fff",
              "--box-shadow": "none",
            }}
          >
            Reply
          </IonButton>
        </IonItem>
        {reply.replies && reply.replies.map((childReply) => renderReplyItem(childReply, depth + 1))}
      </div>
    );
  };

  return (
    <IonPage style={{ backgroundColor: "#121212", color: "#f0f0f0" }}>
      {" "}
      {}
      <IonHeader translucent={true}>
        <IonToolbar style={{ backgroundColor: "#1e1e1e", color: "#f0f0f0" }}>
          {" "}
          {}
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" style={{ color: "#f0f0f0" }} /> {}
          </IonButtons>
          <IonTitle style={{ fontSize: "1.1em", color: "#f0f0f0" }}>
            {" "}
            {}
            {postWithReplies?.title || (loading ? "Loading Post" : "Post")}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent
        className="ion-padding"
        style={{ "--padding-bottom": "140px", backgroundColor: "#121212", color: "#f0f0f0" }}
      >
        {loading && <p style={{ fontSize: "0.9em", color: "#777" }}>Loading post...</p>} {}
        {!loading && postWithReplies && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: "#1e1e1e",
              borderRadius: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", marginBottom: "6px" }}>
              <h2
                style={{
                  fontSize: "1.2em",
                  fontWeight: "bold",
                  margin: "0",
                  color: "#eee",
                  marginRight: "10px",
                }}
              >
                {postWithReplies.title}
              </h2>
              {!loading && postWithReplies && postWithReplies.board_slug && (
                <IonChip color="primary" outline style={{ marginLeft: "8px", fontSize: "0.8em" }}>
                  /{postWithReplies.board_slug}/
                </IonChip>
              )}
              <span style={{ fontSize: "0.8em", color: "#777", marginLeft: "10px" }}>
                {" "}
                {}
                No. {postId}
              </span>
            </div>
            <p
              className="post-metadata"
              style={{ fontSize: "0.8em", color: "#777", marginBottom: "8px" }}
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
              {postWithReplies.image_url && (
                <img
                  src={postWithReplies.image_url}
                  alt="Post Image"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    marginTop: "8px",
                    marginBottom: "12px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
                  }}
                />
              )}
            </div>
          </div>
        )}
        {!loading && postWithReplies && postWithReplies.replies.length > 0 && (
          <h3 style={{ fontSize: "1em", fontWeight: "bold", marginBottom: "10px", color: "#eee" }}>
            Replies
          </h3>
        )}
        <IonList lines="none" style={{ backgroundColor: "transparent" }}>
          {!loading &&
            postWithReplies &&
            postWithReplies.replies.map((reply: Reply) => renderReplyItem(reply))}
        </IonList>
        {!loading && postWithReplies && (
          <div
            style={{
              marginTop: "20px",
              backgroundColor: "#1e1e1e",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            {replyingToId && replyingToContent && (
              <div
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  borderLeft: "2px solid var(--ion-color-primary)",
                  backgroundColor: "#2a2a2a",
                  borderRadius: "4px",
                  fontSize: "0.8em",
                  color: "#ddd",
                }}
              >
                Replying to: "
                {replyingToContent.length > 40
                  ? replyingToContent.substring(0, 40) + "..."
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
                backgroundColor: "#2a2a2a",
                color: "#f0f0f0",
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
                  color: "#f0f0f0",
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
                backgroundColor: "#2a2a2a",
                color: "#f0f0f0",
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
                style={{ fontSize: "0.85em", color: "#f0f0f0" }}
              />
              {replyFile && (
                <IonLabel style={{ fontSize: "0.8em", marginTop: "4px", color: "#777" }}>
                  {" "}
                  {}
                  Selected: {replyFile.name}
                </IonLabel>
              )}
            </IonItem>
            <IonButton
              expand="block"
              onClick={handleReplySubmit}
              disabled={!newReplyContent.trim() && !replyFile}
              style={{
                marginTop: "10px",
                fontSize: "0.9em",
                borderRadius: "6px",
                height: "36px",
                backgroundColor: "var(--ion-color-primary)",
                color: "#fff",
                "--box-shadow": "none",
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
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  setReplyFile(null);
                  setReplyFileName(null);
                }}
                style={{ fontSize: "0.8em", marginTop: "8px", color: "#777" }}
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
          <p style={{ fontSize: "0.9em", color: "#777" }}>Post not found.</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PostDetail;
