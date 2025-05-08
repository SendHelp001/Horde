import {
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonMenuButton,
  IonPage,
  IonRouterOutlet,
  IonTab,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import {
  homeOutline,
  addOutline,
  searchOutline,
  personOutline,
  notificationsOutline,
} from "ionicons/icons";
import { Route, Redirect } from "react-router";
import Create from "../pages/home-tabs/Create";
import Explore from "../pages/home-tabs/Explore";
import PostDetail from "../pages/home-tabs/PostDetail";
import Notifications from "../pages/home-tabs/Notifications";
import Feed from "../pages/home-tabs/Feed";
import BoardPostsPage from "./boards/BoardPostsPage";

function Menu() {
  const tabs = [
    {
      name: "Home",
      tab: "feed",
      url: "/horde/app/feed",
      icon: homeOutline,
    },
    {
      name: "Explore",
      tab: "explore",
      url: "/horde/app/explore",
      icon: searchOutline,
    },
    {
      name: "Create",
      tab: "create",
      url: "/horde/app/create",
      icon: addOutline,
    },
  ];

  return (
    <IonReactRouter>
      <IonTabs>
        <IonTabBar slot="bottom">
          {tabs.map((item, index) => (
            <IonTabButton key={index} tab={item.tab} href={item.url}>
              <IonIcon icon={item.icon}> </IonIcon>
              <IonLabel> {item.name} </IonLabel>
            </IonTabButton>
          ))}
        </IonTabBar>
        <IonRouterOutlet id="main">
          <Route exact path="/horde/app/feed" component={Feed} />
          <Route exact path="/horde/app/explore" component={Explore} />
          <Route path="/horde/app/board/:slug" component={BoardPostsPage} exact />
          <Route exact path="/horde/app/create" component={Create} />
          <Route path="/horde/app/post/:postId" component={PostDetail} />

          {/* Placeholder */}
          <Route exact path="/horde/app">
            <Redirect to="/horde/app/feed" />
          </Route>
        </IonRouterOutlet>
      </IonTabs>
    </IonReactRouter>
  );
}

export default Menu;
