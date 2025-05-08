import React, { useEffect, useState } from "react";
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle } from "@ionic/react";
import { useParams } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import { Reply } from "./PostDetail"; // Assuming your Reply interface is here
import { renderReplyItem } from "./PostDetail"; // You might need to export this

const SubThreadView: React.FC = () => {
  const { postId, replyId } = useParams<{ postId: string; replyId: string }>();
  const [focusedReply, setFocusedReply] = useState<Reply | null>(null);
  const [subThreadReplies, setSubThreadReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubThread = async () => {
      setLoading(true);
      setError(null);
      if (postId && replyId) {
        try {
          // Fetch the focused reply
          const { data: focusedData, error: focusedError } = await supabase
            .from("replies")
            .select("*")
            .eq("id", replyId)
            .single();

          if (focusedError) {
            setError("Failed to load focused reply.");
            return;
          }
          setFocusedReply(focusedData);

          // Fetch all replies for the current post
          const { data: allRepliesData, error: allRepliesError } = await supabase
            .from("replies")
            .select("*")
            .eq("guide_id", postId);

          if (allRepliesError) {
            setError("Failed to load all replies for the post.");
            return;
          }

          // Build the nested reply structure starting from the focused reply
          const nestedSubThread = buildNestedRepliesStartingFrom(
            allRepliesData as Reply[],
            parseInt(replyId, 10)
          );
          setSubThreadReplies(nestedSubThread);
        } catch (err: any) {
          setError("An unexpected error occurred.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSubThread();
  }, [postId, replyId]);

  // Helper function to build nested replies starting from a specific ID
  const buildNestedRepliesStartingFrom = (replies: Reply[], startId: number): Reply[] => {
    const map: Record<number, Reply & { children: Reply[] }> = {};
    const roots: (Reply & { children: Reply[] })[] = [];

    replies.forEach((reply) => {
      map[reply.id] = { ...reply, children: [] };
    });

    replies.forEach((reply) => {
      if (reply.parent_id !== null && map[reply.parent_id]) {
        map[reply.parent_id].children.push(map[reply.id]);
      } else if (reply.id === startId) {
        roots.push(map[reply.id]);
      }
    });

    return roots; // Will be an array containing the starting reply and its descendants
  };

  if (loading)
    return (
      <IonContent>
        <p>Loading sub-thread...</p>
      </IonContent>
    );
  if (error)
    return (
      <IonContent>
        <p>Error: {error}</p>
      </IonContent>
    );
  if (!focusedReply)
    return (
      <IonContent>
        <p>Reply not found.</p>
      </IonContent>
    );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Sub-Thread</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ backgroundColor: "#000", color: "#fff" }}>
        {focusedReply && renderReplyItem(focusedReply, 0)}
        {subThreadReplies.length > 0 &&
          subThreadReplies[0]?.children?.map((reply, index) => renderReplyItem(reply, 1))}{" "}
        {/* Render direct children */}
        {subThreadReplies.length > 0 &&
          subThreadReplies[0]?.children?.flatMap((reply) =>
            reply.replies?.map((nestedReply, depth) => renderReplyItem(nestedReply, 2 + depth))
          )}{" "}
        {/* Render deeper nesting */}
      </IonContent>
    </IonPage>
  );
};

export default SubThreadView;
