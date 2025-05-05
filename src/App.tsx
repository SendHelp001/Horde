import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import {
  homeOutline,
  addOutline,
  searchOutline,
  personOutline,
  notificationsOutline,
} from "ionicons/icons";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Explore from "./pages/Explore"; // New page for Explore
import PostDetail from "./pages/PostDetail";
import Notifications from "./pages/Notifications"; // New page for Notifications
import Profile from "./pages/Profile"; // New page for Profile

/* Core & optional CSS */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Dark mode system preference */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/home">
            <Home />
          </Route>
          <Route exact path="/create">
            <Create />
          </Route>
          <Route exact path="/explore">
            <Explore /> {/* Explore page */}
          </Route>
          <Route exact path="/notifications">
            <Notifications /> {/* Notifications page */}
          </Route>
          <Route exact path="/profile">
            <Profile /> {/* Profile page */}
          </Route>
          <Route path="/post/:postId">
            <PostDetail />
          </Route>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/home">
            <IonIcon icon={homeOutline} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>

          <IonTabButton tab="explore" href="/explore">
            {" "}
            {/* Updated route for Explore */}
            <IonIcon icon={searchOutline} />
            <IonLabel>Explore</IonLabel>
          </IonTabButton>

          <IonTabButton tab="create" href="/create">
            <IonIcon icon={addOutline} />
            <IonLabel>Create</IonLabel>
          </IonTabButton>

          <IonTabButton tab="notifications" href="/notifications">
            {" "}
            {/* Updated route for Notifications */}
            <IonIcon icon={notificationsOutline} />
            <IonLabel>Notifications</IonLabel>
          </IonTabButton>

          <IonTabButton tab="profile" href="/profile">
            {" "}
            {/* Updated route for Profile */}
            <IonIcon icon={personOutline} />
            <IonLabel>Profile</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
