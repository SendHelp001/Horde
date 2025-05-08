import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewDidEnter,
} from "@ionic/react";

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
          <IonHeader>
            <IonToolbar>
              <IonTitle>Feed</IonTitle>
            </IonToolbar>
          </IonHeader>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef}>
        <FeedContainer />
      </IonContent>
    </IonPage>
  );
};

export default Feed;
