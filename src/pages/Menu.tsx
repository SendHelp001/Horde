import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonMenu,
  IonMenuToggle,
  IonPage,
  IonRouterOutlet,
  IonSplitPane,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { homeOutline, rocketOutline, settingsOutline } from "ionicons/icons";
import { Redirect, Route } from "react-router";
import Favorites from "./Favorites.";
import Home from "./Home";
import Profile from "./Profile";

const Menu: React.FC = () => {
  const path = [
    { name: "Home", url: "/horde/app/home", icon: homeOutline },
    { name: "About", url: "/horde/app/favorites", icon: rocketOutline },
    { name: "Profile", url: "/horde/app/profile", icon: settingsOutline },
  ];

  return (
    <IonPage>
      <IonSplitPane contentId="main">
        <IonMenu contentId="main">
          <IonHeader>
            <IonToolbar>
              <IonTitle>Menu</IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent fullscreen>
            {path.map((item, index) => (
              <IonMenuToggle key={index}>
                <IonItem routerLink={item.url} routerDirection="forward">
                  <IonIcon icon={item.icon} slot="start"></IonIcon>
                  {item.name}
                </IonItem>
              </IonMenuToggle>
            ))}

            <IonButton routerLink="/horde" routerDirection="back" expand="full">
              <IonIcon icon="logOutline" slot="start"></IonIcon>
              Logout
            </IonButton>
          </IonContent>
        </IonMenu>
        <IonRouterOutlet id="main">
          <Route exact path="/horde/app/home" component={Home} />
          <Route exact path="/horde/app/about" component={Favorites} />
          <Route exact path="/horde/app/profile" component={Profile} />
          <Route exact path="/horde/app">
            <Redirect to="/horde/app/home" />
          </Route>
        </IonRouterOutlet>
      </IonSplitPane>
    </IonPage>
  );
};

export default Menu;
