import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  useIonViewDidEnter,
  IonChip,
  IonToggle,
  IonAlert,
  useIonModal,
  IonButton,
} from "@ionic/react";
import { useRef, useState, useEffect } from "react";
import { transitionFade } from "../../animations/transition";
import { supabase } from "../../utils/supabaseClient";
import { useHistory } from "react-router-dom";
import { OverlayEventDetail } from "@ionic/core";

interface Board {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

const CURRENT_YEAR = new Date().getFullYear();
const AGE_THRESHOLD = 21;
const TARGET_BIRTH_YEAR = CURRENT_YEAR - AGE_THRESHOLD;

interface TapTheYearMinigameProps {
  onDismiss: (data: any, role: string) => void;
}

const TapTheYearMinigame: React.FC<TapTheYearMinigameProps> = ({ onDismiss }) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const years = Array.from({ length: 10 }, (_, i) => TARGET_BIRTH_YEAR - 5 + i);

  const handleYearTap = (year: number) => {
    setSelectedYear(year);
    if (year === TARGET_BIRTH_YEAR) {
      setIsCorrect(true);
      setTimeout(() => onDismiss({ success: true }, "confirm"), 1000);
    } else {
      setIsCorrect(false);
      setTimeout(() => setIsCorrect(null), 1500);
    }
  };

  return (
    <IonContent className="ion-padding">
      <h2>Age Verification</h2>
      <p>
        Tap the year you would have turned {AGE_THRESHOLD} if the current year was {CURRENT_YEAR}.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))",
          gap: "10px",
          margin: "20px 0",
        }}
      >
        {years.map((year) => (
          <IonButton
            key={year}
            onClick={() => handleYearTap(year)}
            color={selectedYear === year ? (isCorrect ? "success" : "danger") : undefined}
          >
            {year}
          </IonButton>
        ))}
      </div>
      {isCorrect === false && <p style={{ color: "red" }}>Incorrect year. Please try again.</p>}
    </IonContent>
  );
};

const Explore: React.FC = () => {
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const [allBoards, setAllBoards] = useState<Board[]>([]);
  const [filteredBoards, setFilteredBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNSFWActive, setIsNSFWActive] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [showToggle, setShowToggle] = useState(false);
  const [showDiscoveryAlert, setShowDiscoveryAlert] = useState(false);
  const [minigameCompleted, setMinigameCompleted] = useState(false);
  const history = useHistory();

  // Modal controller
  const [presentMinigame, dismissMinigame] = useIonModal(TapTheYearMinigame, {
    onDismiss: (data: any, role: string) => {
      dismissMinigame();
      if (role === "confirm" && data?.success) {
        setIsNSFWActive(true);
        setMinigameCompleted(true);
        setShowToggle(true);
      } else {
        setIsNSFWActive(false);
        setMinigameCompleted(false);
        setShowToggle(false);
        setTapCount(0);
      }
    },
  });

  useIonViewDidEnter(() => {
    if (contentRef.current) {
      transitionFade(contentRef.current, "in");
    }
  });

  useEffect(() => {
    const fetchAvailableBoards = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("boards")
        .select("id, name, slug, description")
        .order("name");

      if (error) {
        console.error("Error fetching boards:", error);
        setLoading(false);
        return;
      }

      if (data) {
        setAllBoards(data);
      }
      setLoading(false);
    };

    fetchAvailableBoards();
  }, []);

  useEffect(() => {
    if (!isNSFWActive) {
      const nonNsfwBoards = allBoards.filter((board) => board.slug !== "bbb");
      setFilteredBoards(nonNsfwBoards);
    } else {
      const nsfwBoards = allBoards.filter((board) => board.slug === "bbb");
      setFilteredBoards(nsfwBoards);
    }
  }, [allBoards, isNSFWActive]);

  const handleBoardClick = (slug: string) => {
    history.push(`/horde/app/board/${slug}`);
  };

  const handleToolbarTap = () => {
    if (!minigameCompleted) {
      setTapCount((prevCount) => prevCount + 1);
    }
  };

  useEffect(() => {
    if (tapCount >= 5 && !showToggle) {
      setShowDiscoveryAlert(true);
    }
  }, [tapCount, showToggle]);

  const handleDiscoveryAlertDismiss = () => {
    setShowDiscoveryAlert(false);
    setShowToggle(true);
  };

  const handleNSFWToggleChange = (event: any) => {
    if (!minigameCompleted) {
      presentMinigame();
    } else {
      setIsNSFWActive(!isNSFWActive);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar onClick={handleToolbarTap}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "20%",
              zIndex: 10,
              backgroundColor: "transparent",
              pointerEvents: minigameCompleted ? "none" : "auto",
            }}
          />
          <IonTitle>Explore Boards</IonTitle>
          {showToggle && (
            <IonToggle
              style={{ marginLeft: "10px" }}
              slot="end"
              checked={isNSFWActive}
              onIonChange={handleNSFWToggleChange}
            >
              Show NSFW
            </IonToggle>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef} fullscreen className="ion-padding">
        {loading ? (
          <p>Loading available boards...</p>
        ) : (
          <div style={{ marginBottom: "100px" }}>
            <IonList>
              {filteredBoards.map((board) => (
                <IonItem key={board.id} onClick={() => handleBoardClick(board.slug)} detail>
                  <IonLabel>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <h2>{board.name}</h2>
                      <IonChip
                        color={board.slug === "bbb" ? "danger" : "secondary"}
                        outline
                        style={{ marginTop: "0px", marginLeft: "8px" }}
                      >
                        {board.slug}
                      </IonChip>
                    </div>
                    {board.description && <p style={{ marginTop: "8px" }}>{board.description}</p>}
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </div>
        )}
      </IonContent>

      <IonAlert
        isOpen={showDiscoveryAlert}
        onDidDismiss={handleDiscoveryAlertDismiss}
        header="Secret Found!"
        message="You discovered a hidden button! The 'Show NSFW' toggle is now visible."
        buttons={["Okay"]}
      />
    </IonPage>
  );
};

export default Explore;
