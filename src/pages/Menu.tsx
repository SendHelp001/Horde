import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonPage,
} from "@ionic/react";
import { Redirect, Route, Switch } from "react-router-dom";
import {
  homeOutline,
  addOutline,
  searchOutline,
  personOutline,
  notificationsOutline,
} from "ionicons/icons";
import Create from "../pages/home-tabs/Create";
import Explore from "../pages/home-tabs/Explore";
import PostDetail from "../pages/home-tabs/PostDetail";
import Notifications from "../pages/home-tabs/Notifications";
import Feed from "../pages/home-tabs/Feed";
import BoardPostsPage from "./boards/BoardPostsPage";

const Menu: React.FC = () => {
  return (
    <IonPage>
      <IonTabs>
        <IonRouterOutlet id="main">
          <Switch>
            <Route exact path="/Horde/app/Feed" component={Feed} />
            <Route exact path="/Horde/app/explore" component={Explore} />
            <Route path="/Horde/app/board/:slug" component={BoardPostsPage} exact />
            <Route exact path="/Horde/app/create" component={Create} />
            {/* <Route exact path="/Horde/app/notifications" component={Notifications} /> */}
            <Route path="/Horde/app/post/:postId" component={PostDetail} />
            <Route exact path="/Horde/app">
              <Redirect to="/Horde/app/Feed" />
            </Route>
          </Switch>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="feed" href="/Horde/app/Feed">
            <IonIcon icon={homeOutline} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>

          <IonTabButton tab="explore" href="/Horde/app/explore">
            <IonIcon icon={searchOutline} />
            <IonLabel>Explore</IonLabel>
          </IonTabButton>

          <IonTabButton tab="create" href="/Horde/app/create">
            <IonIcon icon={addOutline} />
            <IonLabel>Create</IonLabel>
          </IonTabButton>

          {/* <IonTabButton tab="notifications" href="/Horde/app/notifications">
            <IonIcon icon={notificationsOutline} />
            <IonLabel>Notifications</IonLabel>
          </IonTabButton> */}

          {/* <IonTabButton tab="profile" href="/Horde/app/profile">
            <IonIcon icon={personOutline} />
            <IonLabel>Profile</IonLabel>
          </IonTabButton> */}
        </IonTabBar>
      </IonTabs>
    </IonPage>
  );
};

export default Menu;
