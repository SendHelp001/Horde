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
} from "@ionic/react";
import { useRef, useState, useEffect } from "react";
import { transitionFade } from "../../animations/transition";
import { supabase } from "../../utils/supabaseClient";
import { useHistory } from "react-router-dom";

interface Board {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

const Explore: React.FC = () => {
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

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
        setBoards(data);
      }
      setLoading(false);
    };

    fetchAvailableBoards();
  }, []);

  const handleBoardClick = (slug: string) => {
    history.push(`/horde/app/board/${slug}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Explore Boards</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef} fullscreen className="ion-padding">
        {loading ? (
          <p>Loading available boards...</p>
        ) : (
          <IonList>
            {boards.map((board) => (
              <IonItem
                key={board.id}
                onClick={() => handleBoardClick(board.slug)}
                detail // Adds a visual cue that the item is clickable
              >
                <IonLabel>
                  <h2>{board.name}</h2>
                  {board.description && <p>{board.description}</p>}
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Explore;
