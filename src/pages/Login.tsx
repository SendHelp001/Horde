import {
  IonButton,
  IonContent,
  IonInput,
  IonLabel,
  IonPage,
  IonIcon,
  useIonRouter,
  useIonToast,
  IonItem,
} from "@ionic/react";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import "./Login.css";
import { mailOutline, lockClosedOutline, eyeOutline, logoGoogle } from "ionicons/icons";
import { Redirect } from "react-router";

const Login: React.FC = () => {
  const [present] = useIonToast();
  const navigation = useIonRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const showToast = (message: string, color: "primary" | "danger") => {
    present({
      message,
      duration: 2000,
      color,
      position: "top",
    });
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      showToast(error.message, "danger");
      return;
    }

    showToast("Login successful! Redirecting...", "primary");
    navigation.push("/app/home", "forward", "replace");
  };

  const handleOAuthLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      showToast(error.message, "danger");
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  };

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const { data: sessionData, error } = await supabase.auth.getSession();

      if (error) {
        showToast(error.message, "danger");
        return;
      }

      if (sessionData?.session) {
        showToast("Login successful! Redirecting...", "primary");
        navigation.push("/app/home", "forward", "replace");
      }
    };

    if (
      window.location.search.includes("access_token") ||
      window.location.hash.includes("access_token")
    ) {
      handleOAuthCallback();
    }
  }, [navigation]);

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen>
        <div className="login-container">
          {/* Logo */}
          <div className="logo-container">
            <img src="/public/homeIcon.png" alt="Logo" className="logo" />
          </div>

          <h1 className="welcome-text">Horde</h1>

          <IonItem lines="none" className="input-item" style={{ marginBottom: "10px" }}>
            <IonInput
              labelPlacement="floating"
              label="Email Address"
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
              placeholder="your@email.com"
              fill="solid"
              inputMode="email"
            ></IonInput>
          </IonItem>

          <IonItem lines="none" className="input-item" style={{ marginBottom: "10px" }}>
            <IonInput
              labelPlacement="floating"
              label="Password"
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
              placeholder="********"
              fill="solid"
              inputMode="text"
            ></IonInput>
          </IonItem>

          {/* Login Button */}
          <IonButton expand="block" className="login-button" onClick={handleLogin}>
            Login
          </IonButton>

          {/* Footer */}
          <div className="footer">
            <IonButton
              fill="clear"
              color="light"
              className="footer-link"
              onClick={() => navigation.push("/horde/signup")}
            >
              Sign up
            </IonButton>
            <IonButton fill="clear" color="light" className="footer-link">
              Forgot Password?
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
