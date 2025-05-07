import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewDidEnter,
} from "@ionic/react";
import ExploreContainer from "../../components/ExploreContainer";
import { useRef } from "react";
import { transitionFade } from "../../animations/transition";
import FeedContainer from "../../components/FeedContainer";

const Feed: React.FC = () => {
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
          <IonTitle>Feed</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef} fullscreen>
        <FeedContainer />
      </IonContent>{" "}
    </IonPage>
  );
};

export default Feed;
