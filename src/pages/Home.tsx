import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel } from "@ionic/react";
import { Redirect, Route } from "react-router-dom";
import {
  homeOutline,
  addOutline,
  searchOutline,
  personOutline,
  notificationsOutline,
} from "ionicons/icons";
import Feed from "../pages/Home";
import Create from "../pages/home-tabs/Create";
import Explore from "../pages/home-tabs/Explore";
import PostDetail from "../pages/home-tabs/PostDetail";
import Notifications from "../pages/home-tabs/Notifications";
import Profile from "../pages/Profile";

const Home: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet id="main">
        <Route exact path="/horde/app/home" component={Home} />
        <Route exact path="/horde/app/explore" component={Explore} />
        <Route exact path="/horde/app/create" component={Create} />
        <Route exact path="/horde/app/notifications" component={Notifications} />
        <Route exact path="/horde/app/profile" component={Profile} />
        <Route path="/horde/app/post/:postId" component={PostDetail} />
        <Route exact path="/horde/app">
          <Redirect to="/horde/app/home" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/horde/app/home">
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

        <IonTabButton tab="notifications" href="/horde/app/notifications">
          <IonIcon icon={notificationsOutline} />
          <IonLabel>Notifications</IonLabel>
        </IonTabButton>

        <IonTabButton tab="profile" href="/horde/app/profile">
          <IonIcon icon={personOutline} />
          <IonLabel>Profile</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default Home;
