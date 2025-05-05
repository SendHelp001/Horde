import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonPage,
} from "@ionic/react";
import {
  homeOutline,
  searchOutline,
  addOutline,
  notificationsOutline,
  personOutline,
} from "ionicons/icons";
import { Redirect, Route } from "react-router-dom";
import { IonReactRouter } from "@ionic/react-router";

import Home from "./Home";
import Create from "./Create";
import Explore from "./Explore";
import Notifications from "./Notifications";
import Profile from "./Profile";
import PostDetail from "./PostDetail";
import Login from "./Login";

import { useAuth } from "../utils/AuthProvider";

const Menu: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) return null; // wait for session check

  return (
    <IonPage>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/home" render={() => <Home />} />
            <Route exact path="/create" render={() => <Create />} />
            <Route exact path="/explore" render={() => <Explore />} />
            <Route exact path="/post/:postId" render={() => <PostDetail />} />
            <Route exact path="/notifications" render={() => <Notifications />} />

            {/* Protect Profile Route */}
            <Route
              exact
              path="/profile"
              render={() => (session ? <Profile /> : <Redirect to="/it35-lab" />)}
            />

            <Route
              exact
              path="/profile/:userId"
              render={() => (session ? <Profile /> : <Redirect to="/it35-lab" />)}
            />

            {/* Optional login route fallback */}
            <Route exact path="/login" render={() => <Login />} />

            {/* Redirect root based on session */}
            <Route exact path="/">
              {session ? <Redirect to="/home" /> : <Redirect to="/it35-lab" />}
            </Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/home">
              <IonIcon icon={homeOutline} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>

            <IonTabButton tab="explore" href="/explore">
              <IonIcon icon={searchOutline} />
              <IonLabel>Explore</IonLabel>
            </IonTabButton>

            <IonTabButton tab="create" href="/create">
              <IonIcon icon={addOutline} />
              <IonLabel>Create</IonLabel>
            </IonTabButton>

            <IonTabButton tab="notifications" href="/notifications">
              <IonIcon icon={notificationsOutline} />
              <IonLabel>Notifications</IonLabel>
            </IonTabButton>

            <IonTabButton tab="profile" href="/profile">
              <IonIcon icon={personOutline} />
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonPage>
  );
};

export default Menu;
