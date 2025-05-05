import {
  IonButton,
  IonContent,
  IonInput,
  IonLabel,
  IonPage,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

const Signup: React.FC = () => {
  const [present] = useIonToast();
  const navigation = useIonRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const showToast = (message: string, color: "primary" | "danger") => {
    present({
      message,
      duration: 2000,
      color,
      position: "top",
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
      navigation.push("/login", "forward", "replace"); // Redirect to login page after signup
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            maxWidth: 400,
            margin: "0 auto",
          }}
        >
          <h1 style={{ textAlign: "center", fontWeight: "bold", fontSize: "24px" }}>Sign Up</h1>

          {/* Email Input */}
          <IonLabel>Email</IonLabel>
          <IonInput
            type="email"
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
            fill="outline"
          />

          {/* Password Input */}
          <IonLabel>Password</IonLabel>
          <IonInput
            type="password"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value!)}
            fill="outline"
          />

          <IonButton expand="block" onClick={handleSignup} style={{ marginTop: "20px" }}>
            Sign Up
          </IonButton>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <span>Already have an account?</span>
          </div>

          <IonButton expand="block" routerLink="/login" fill="clear" style={{ marginTop: 8 }}>
            Log In
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Signup;
