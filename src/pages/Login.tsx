import { IonButton, IonContent, IonPage, useIonRouter } from "@ionic/react";
import homeIcon from "../assets/homeIcon.png";
import "./Login.css";

const Login: React.FC = () => {
  const navigation = useIonRouter();

  const handleAnonymousLogin = () => {
    navigation.push("/horde/app/Feed", "forward", "replace"); // Redirect to the Menu component
    console.log("Anonymous login initiated."); // Optional: Log the action
    // In a real scenario, you might want to set some kind of anonymous session here.
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen>
        <div className="login-container">
          <div className="logo-container">
            <img src={homeIcon} alt="Logo" className="logo" />
          </div>

          <h1 className="welcome-text">horde</h1>

          {/* Login Button */}
          <IonButton expand="block" className="login-button" onClick={handleAnonymousLogin}>
            Enter Anonymously
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
