import {
  IonContent,
  IonPage,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonTextarea,
  IonItem,
  IonLabel,
  IonAlert,
  useIonViewDidEnter,
} from "@ionic/react";
import { useRef, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { transitionFade } from "../animations/transition";
import Markdown from "marked-react";

const Create: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const contentRef = useRef<HTMLIonContentElement | null>(null);

  useIonViewDidEnter(() => {
    if (contentRef.current) {
      transitionFade(contentRef.current, "in");
    }
  });

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setAlertMessage("Please fill in all fields");
      setShowAlert(true);
      return;
    }

    const { data, error } = await supabase.from("guides").insert([
      {
        title: title.trim(),
        content: content.trim(),
        votes: 0,
      },
    ]);

    if (error) {
      setAlertMessage("Failed to create guide");
    } else {
      setAlertMessage("Guide created successfully!");
      setTitle("");
      setContent("");
    }
    setShowAlert(true);
  };

  const applyFormatting = (type: string) => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const el = textarea as HTMLTextAreaElement;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = content.substring(start, end);

    let formatted = selectedText;
    switch (type) {
      case "H1":
        formatted = `# ${selectedText}`;
        break;
      case "H2":
        formatted = `## ${selectedText}`;
        break;
      case "H3":
        formatted = `### ${selectedText}`;
        break;
      case "Bold":
        formatted = `**${selectedText}**`;
        break;
      case "Italic":
        formatted = `*${selectedText}*`;
        break;
      case "Quote":
        formatted = `> ${selectedText}`;
        break;
      case "Code":
        formatted = `\`\`\`\n${selectedText}\n\`\`\``;
        break;
    }

    const updatedContent = content.substring(0, start) + formatted + content.substring(end);
    setContent(updatedContent);

    // Move caret after inserted text
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + formatted.length;
    }, 0);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Create Post</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent ref={contentRef} fullscreen>
        <div className="ion-padding" style={{ paddingBottom: "140px" }}>
          <IonItem lines="none" style={{ "--background": "transparent" }}>
            <IonLabel position="stacked" className="text-xs text-gray-500">
              Post Title
            </IonLabel>
            <IonInput
              value={title}
              onIonInput={(e: any) => setTitle(e.target.value)}
              placeholder="What's it about?"
              style={{
                "--border-radius": "12px",
                "--padding-start": "12px",
                "--padding-end": "12px",
                "--ion-color": "var(--ion-color-dark, #333)",
              }}
            />
          </IonItem>

          <IonItem lines="none" className="mt-2" style={{ "--background": "transparent" }}>
            <IonLabel position="stacked" className="text-xs text-gray-500">
              Details
            </IonLabel>
            <IonTextarea
              value={content}
              onIonInput={(e: any) => setContent(e.target.value)}
              placeholder="Write the steps, insights, or information here..."
              autoGrow
              style={{
                "--border-radius": "12px",
                "--padding-start": "12px",
                "--padding-end": "12px",
              }}
            />
          </IonItem>

          {/* Live Markdown Preview with Theming */}
          <div className="ion-padding" style={{ marginTop: "20px" }}>
            <h2>Preview:</h2>
            <div
              className="markdown-preview"
              style={{
                padding: "10px",
                background: "var(--ion-item-background, #f7f7f7)", // Use background that matches theme
                borderRadius: "10px",
                color: "var(--ion-text-color, #333)", // Text color that matches theme
              }}
            >
              <Markdown>{content}</Markdown>
            </div>
          </div>
        </div>

        {/* Fixed Toolbar and Submit Button Container */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "var(--ion-item-background, #fff)", // Theme-aware background color
            boxShadow: "0 -2px 8px rgba(0,0,0,0.15)",
            padding: "12px 16px",
            zIndex: 100,
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
          }}
        >
          {/* Formatting Toolbar */}
          <div
            style={{
              overflowX: "auto",
              whiteSpace: "nowrap",
              display: "flex",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            {["H1", "H2", "H3", "Bold", "Italic", "Quote", "Code"].map((type) => (
              <IonButton
                size="small"
                fill="solid"
                onClick={() => applyFormatting(type)}
                key={type}
                style={{
                  "--background": "var(--ion-color-primary, #3880ff)", // Primary color
                  "--color": "var(--ion-color-light, #ffffff)", // Text color for the button
                  "--border-radius": "8px",
                  "--padding-start": "12px",
                  "--padding-end": "12px",
                }}
              >
                {type}
              </IonButton>
            ))}
          </div>

          {/* Submit Button */}
          <IonButton
            expand="block"
            onClick={handleSubmit}
            style={{
              "--background": "var(--ion-color-primary, #3880ff)", // Primary color
              "--color": "var(--ion-color-light, #ffffff)", // Text color
              "--border-radius": "12px",
              "--padding-start": "16px",
              "--padding-end": "16px",
            }}
          >
            Submit
          </IonButton>
        </div>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertMessage.includes("successfully") ? "Success" : "Error"}
          message={alertMessage}
          buttons={["OK"]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Create;
