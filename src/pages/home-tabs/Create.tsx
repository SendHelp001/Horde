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
  IonIcon,
  IonButtons,
  IonSelect,
  IonSelectOption,
  IonActionSheet,
} from "@ionic/react";
import { useRef, useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { transitionFade } from "../../animations/transition";
import Markdown from "marked-react";
import { imageOutline } from "ionicons/icons";

// If you installed the package, you can keep this import
// import 'material-symbols/css/outlined.css';

const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const Create: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const [boards, setBoards] = useState<any[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  useEffect(() => {
    const fetchBoards = async () => {
      const { data, error } = await supabase.from("boards").select("*");
      if (error) {
        console.error("Error fetching boards:", error);
        setAlertMessage("Failed to load boards.");
        setShowAlert(true);
      } else if (data) {
        setBoards(data);
      }
    };

    fetchBoards();
  }, []);

  useIonViewDidEnter(() => {
    if (contentRef.current) {
      transitionFade(contentRef.current, "in");
    }
  });

  const handleBoardChange = (event: any) => {
    setSelectedBoardId(parseInt(event.detail.value, 10));
  };

  const handleImageInputChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setAlertMessage(`Image size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.`);
        setShowAlert(true);
        event.target.value = "";
        setSelectedImage(null);
        setSelectedImageName(null);
        return;
      }
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);
        setSelectedImageName(file.name);
      } else {
        setAlertMessage("Please select an image file.");
        setShowAlert(true);
        event.target.value = "";
        setSelectedImage(null);
        setSelectedImageName(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !selectedBoardId) {
      setAlertMessage("Please fill in all fields and select a board.");
      setShowAlert(true);
      return;
    }

    let imageUrl: string | null = null;
    let imageName: string | null = null;
    let imageType: string | null = null;

    if (selectedImage) {
      if (selectedImage.size > MAX_FILE_SIZE_BYTES) {
        setAlertMessage(`Image size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.`);
        setShowAlert(true);
        return;
      }
      try {
        const filePath = `boards/${selectedBoardId}/${Date.now()}-${selectedImage.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("post-images") // Replace with your actual bucket name
          .upload(filePath, selectedImage);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          setAlertMessage("Failed to upload image");
          setShowAlert(true);
          return;
        }

        imageUrl =
          supabase.storage.from("post-images").getPublicUrl(filePath).data?.publicUrl || null;
        imageName = selectedImage.name;
        imageType = selectedImage.type;
      } catch (error: any) {
        console.error("Error during image upload:", error);
        setAlertMessage("Error during image upload");
        setShowAlert(true);
        return;
      }
    }

    const { data, error } = await supabase
      .from("guides")
      .insert([
        {
          board_id: selectedBoardId,
          title: title.trim(),
          content: content.trim(),
          image_url: imageUrl,
          image_name: imageName,
          image_type: imageType,
          votes: 0,
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Error creating guide:", error);
      setAlertMessage("Failed to create guide.");
      setShowAlert(true);
    } else {
      setAlertMessage("Guide created successfully!");
      setTitle("");
      setContent("");
      setSelectedImage(null);
      setSelectedImageName(null);
      setSelectedBoardId(null);
      // Optionally navigate to the new thread using data.id
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
      case "UL":
        formatted = `* ${selectedText}\n`;
        break;
      case "OL":
        formatted = `1. ${selectedText}\n`;
        break;
      case "H1":
        formatted = `# ${selectedText}`;
        break;
      case "H2":
        formatted = `## ${selectedText}`;
        break;
      case "H3":
        formatted = `### ${selectedText}`;
        break;
    }

    const updatedContent = content.substring(0, start) + formatted + content.substring(end);
    setContent(updatedContent);

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
          <IonButtons slot="end">
            <IonButton onClick={() => document.getElementById("image-upload")?.click()}>
              <IonIcon icon={imageOutline} slot="start" />
              Attach Image
            </IonButton>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              id="image-upload"
              onChange={handleImageInputChange}
            />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent ref={contentRef} fullscreen>
        <div className="ion-padding" style={{ paddingBottom: "140px" }}>
          <IonItem>
            <IonLabel>Board</IonLabel>
            <IonSelect value={selectedBoardId} onIonChange={handleBoardChange}>
              {boards.map((board) => (
                <IonSelectOption key={board.id} value={board.id}>
                  {board.name} ({board.slug})
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

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

          {selectedImageName && (
            <IonItem lines="none" className="mt-2" style={{ "--background": "transparent" }}>
              <IonLabel>Attached Image: {selectedImageName}</IonLabel>
            </IonItem>
          )}

          {/* Live Markdown Preview */}
          <div className="ion-padding" style={{ marginTop: "20px" }}>
            <h2>Preview:</h2>
            <div
              className="markdown-preview"
              style={{
                padding: "10px",
                background: "var(--ion-item-background, #f7f7f7)",
                borderRadius: "10px",
                color: "var(--ion-text-color, #333)",
              }}
            >
              <Markdown>{content}</Markdown>
            </div>
          </div>
        </div>

        {/* Fixed Toolbar with Formatting Buttons */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "var(--ion-item-background, #fff)",
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
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {[
              { type: "Bold", icon: "format_bold" },
              { type: "Italic", icon: "format_italic" },
              { type: "Quote", icon: "format_quote" },
              { type: "Code", icon: "code" },
              { type: "UL", icon: "format_list_bulleted" },
              { type: "OL", icon: "format_list_numbered" },
            ].map(({ type, icon }) => (
              <IonButton
                size="small"
                fill="solid"
                onClick={() => applyFormatting(type)}
                key={type}
                style={{
                  "--background": "var(--ion-color-primary, #3880ff)",
                  "--color": "var(--ion-color-light, #ffffff)",
                  "--border-radius": "8px",
                  "--padding-start": "12px",
                  "--padding-end": "12px",
                  fontFamily: "Material Symbols Outlined",
                  fontStyle: "normal",
                  fontWeight: 400,
                  fontSize: "1.2rem",
                  lineHeight: 1,
                  letterSpacing: "normal",
                  textTransform: "none",
                  display: "inline-block",
                  whiteSpace: "nowrap",
                  wordWrap: "normal",
                  direction: "ltr",
                  "-webkit-font-smoothing": "antialiased",
                  textRendering: "optimizeLegibility",
                  "-moz-osx-font-smoothing": "grayscale",
                  fontFeatureSettings: "liga",
                }}
              >
                <span className="material-symbols">{icon}</span>
              </IonButton>
            ))}

            <IonButton
              id="open-action-sheet"
              size="small"
              style={{
                "--background": "var(--ion-color-primary, #3880ff)",
                "--color": "var(--ion-color-light, #ffffff)",
                "--border-radius": "8px",
              }}
              onClick={() => setShowActionSheet(true)}
            >
              <span className="material-symbols">format_size</span>
            </IonButton>

            <IonActionSheet
              isOpen={showActionSheet}
              onDidDismiss={() => setShowActionSheet(false)}
              header="Select Text Type"
              buttons={[
                {
                  text: "Heading 1",
                  handler: () => applyFormatting("H1"),
                },
                {
                  text: "Heading 2",
                  handler: () => applyFormatting("H2"),
                },
                {
                  text: "Heading 3",
                  handler: () => applyFormatting("H3"),
                },
                {
                  text: "Cancel",
                  role: "cancel",
                },
              ]}
            ></IonActionSheet>
          </div>

          {/* Submit Button */}
          <IonButton
            expand="block"
            onClick={handleSubmit}
            disabled={!title || !content || !selectedBoardId}
            style={{
              "--background": "var(--ion-color-primary, #3880ff)",
              "--color": "var(--ion-color-light, #ffffff)",
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
