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
            <Route exact path="/horde/app/Feed" component={Feed} />
            <Route exact path="/horde/app/explore" component={Explore} />
            <Route
              path="/horde/app/board/:slug"
              component={BoardPostsPage}
              exact
            />
            <Route exact path="/horde/app/create" component={Create} />
            {/* <Route exact path="/horde/app/notifications" component={Notifications} /> */}
            <Route path="/horde/app/post/:postId" component={PostDetail} />
            <Route exact path="/horde/app">
              <Redirect to="/horde/app/Feed" />
            </Route>
          </Switch>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="feed" href="/horde/app/Feed">
            <IonIcon icon={homeOutline} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>

          <IonTabButton tab="explore" href="/horde/app/explore">
            <IonIcon icon={searchOutline} />
            <IonLabel>Explore</IonLabel>
          </IonTabButton>

          <IonTabButton tab="create" href="/horde/app/create">
            <IonIcon icon={addOutline} />
            <IonLabel>Create</IonLabel>
          </IonTabButton>

          {/* <IonTabButton tab="notifications" href="/horde/app/notifications">
            <IonIcon icon={notificationsOutline} />
            <IonLabel>Notifications</IonLabel>
          </IonTabButton> */}

          {/* <IonTabButton tab="profile" href="/horde/app/profile">
            <IonIcon icon={personOutline} />
            <IonLabel>Profile</IonLabel>
          </IonTabButton> */}
        </IonTabBar>
      </IonTabs>
    </IonPage>
  );
};

export default Menu;
