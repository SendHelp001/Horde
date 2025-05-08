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
  IonToolbar,
  IonTitle,
} from "@ionic/react";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { logoGoogle } from "ionicons/icons";

const Signup: React.FC = () => {
  const [present] = useIonToast();
  const navigation = useIonRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const showToast = (message: string, color: "primary" | "danger") => {
    present({
      message,
      duration: 1500,
      color,
      position: "top",
      cssClass: "toast-sleek",
    });
  };

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    const { user } = data;

    if (error) {
      showToast(error.message, "danger");
      return;
    }

    if (user) {
      showToast("Sign up successful! Please log in.", "primary");
      navigation.push("/Horde/", "forward", "replace"); // Redirect to login page after signup
    }
  };

  return (
    <IonPage>
      <IonToolbar color="primary">
        <IonTitle>Create Account</IonTitle>
      </IonToolbar>
      <IonContent className="ion-padding" fullscreen>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "20px",
          }}
        >
          {/* Logo/App Name */}
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            {/* <img src="/public/your-logo.png" alt="Logo" style={{ width: '80px', height: 'auto' }} /> */}
            <h1
              style={{
                fontSize: "2em",
                fontWeight: "bold",
                color: "var(--ion-color-primary)",
                marginTop: "10px",
              }}
            >
              Horde
            </h1>
          </div>

          <h2 style={{ fontSize: "1.5em", color: "var(--ion-color-dark)", marginBottom: "20px" }}>
            Sign Up
          </h2>

          <IonItem lines="none" style={{ marginBottom: "15px" }}>
            <IonInput
              labelPlacement="floating"
              label="Email Address"
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
              placeholder="your@email.com"
              fill="solid"
              inputMode="email"
              style={{
                "--background": "var(--ion-item-background, #f4f5f8)",
                "--padding-start": "16px",
                "--padding-end": "16px",
                "--inner-padding-end": "0px",
                "border-radius": "8px",
                "--padding-top": "12px",
                "--padding-bottom": "12px",
                "--color": "var(--ion-color-dark)",
              }}
            >
              <IonLabel style={{ color: "var(--ion-color-dark-tint)" }} slot="label">
                Email Address
              </IonLabel>
            </IonInput>
          </IonItem>

          <IonItem lines="none" style={{ marginBottom: "15px" }}>
            <IonInput
              labelPlacement="floating"
              label="Password"
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
              placeholder="********"
              fill="solid"
              inputMode="text"
              style={{
                "--background": "var(--ion-item-background, #f4f5f8)",
                "--padding-start": "16px",
                "--padding-end": "16px",
                "--inner-padding-end": "0px",
                "border-radius": "8px",
                "--padding-top": "12px",
                "--padding-bottom": "12px",
                "--color": "var(--ion-color-dark)",
              }}
            >
              <IonLabel style={{ color: "var(--ion-color-dark-tint)" }} slot="label">
                Password
              </IonLabel>
            </IonInput>
          </IonItem>

          <IonButton
            expand="block"
            onClick={handleSignup}
            style={{
              "--background": "var(--ion-color-primary)",
              "--background-activated": "var(--ion-color-primary-shade)",
              "--color": "#fff",
              "--border-radius": "8px",
              height: "48px",
              "font-weight": "500",
              "margin-top": "20px",
            }}
          >
            Create Account
          </IonButton>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <span>Already have an account?</span>
          </div>

          <IonButton expand="block" routerLink="/login" fill="clear" style={{ marginTop: 8 }}>
            Log In
          </IonButton>

          <div style={{ marginTop: "30px", textAlign: "center" }}>
            <IonButton
              fill="clear"
              color="medium"
              onClick={() => navigation.push("/Horde")}
              style={{ "--padding-start": "8px", "--padding-end": "8px", "font-size": "0.9em" }}
            >
              Already have an account?{" "}
              <span style={{ color: "var(--ion-color-primary)" }}>Log In</span>
            </IonButton>
            {/* You can add a "Forgot Password?" link here if needed */}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Signup;
