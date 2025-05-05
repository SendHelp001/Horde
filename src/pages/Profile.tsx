import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonAvatar,
  IonItem,
  IonLabel,
  IonText,
  IonLoading,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useHistory } from "react-router";

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Session:", session);
      const currentUser = session?.user;
      setUser(currentUser);
      if (currentUser) await ensureUserInDB(currentUser);
      setIsLoading(false);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user;
      setUser(currentUser);
      if (currentUser) ensureUserInDB(currentUser);
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureUserInDB = async (authUser: any) => {
    if (!authUser?.email) return;

    const { data: existingUser, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", authUser.email)
      .single();

    if (error) {
      console.error("Error checking user in DB:", error.message);
      return;
    }

    if (!existingUser) {
      const { error: insertError } = await supabase.from("users").insert([
        {
          email: authUser.email,
          username: authUser.user_metadata?.full_name || authUser.email,
          avatar: authUser.user_metadata?.avatar_url || "/default-avatar.png",
        },
      ]);
      if (insertError) {
        console.error("Error inserting user into DB:", insertError.message);
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign-out error:", error.message);
    } else {
      setUser(null);
      history.replace("/horde"); // Redirect to the login page after sign out
    }
  };

  if (isLoading) {
    return <IonLoading isOpen={isLoading} message="Loading..." />;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {user ? (
          <>
            <IonItem lines="none">
              <IonAvatar slot="start">
                <img
                  src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                  alt="User Avatar"
                />
              </IonAvatar>
              <IonLabel>
                <IonText>
                  <h2>{user.user_metadata?.full_name || "User"}</h2>
                  <p>{user.email}</p>
                </IonText>
              </IonLabel>
            </IonItem>
            <IonButton expand="block" onClick={signOut}>
              Sign Out
            </IonButton>
          </>
        ) : (
          <IonText>No user signed in.</IonText>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Profile;