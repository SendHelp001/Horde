import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewDidEnter,
} from "@ionic/react";
import ExploreContainer from "../../components/ExploreContainer";
import "./Explore.css";
import { useRef } from "react";
import { transitionFade } from "../../animations/transition";

const Explore: React.FC = () => {
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
          <IonTitle>Tab 3</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef} fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 3</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Tab 3 page" />
      </IonContent>{" "}
    </IonPage>
  );
};

export default Explore;
