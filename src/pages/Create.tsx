import {
  IonContent,
  IonHeader,
  IonPage,
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

const Create: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

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

  const contentRef = useRef<HTMLIonContentElement | null>(null);

  useIonViewDidEnter(() => {
    if (contentRef.current) {
      transitionFade(contentRef.current, "in");
    }
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Create Guide</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef} fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Create a New Guide</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
          <IonItem>
            <IonLabel position="stacked">Title</IonLabel>
            <IonInput
              value={title}
              onIonInput={(e: any) => setTitle(e.target.value)}
              placeholder="Enter the title of your guide"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Content</IonLabel>
            <IonTextarea
              value={content}
              onIonInput={(e: any) => setContent(e.target.value)}
              placeholder="Enter the content of your guide"
              rows={6}
            />
          </IonItem>

          <IonButton expand="full" onClick={handleSubmit}>
            Submit Guide
          </IonButton>
        </div>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertMessage === "Guide created successfully!" ? "Success" : "Error"}
          message={alertMessage}
          buttons={["OK"]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Create;
