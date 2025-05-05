import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null); // Default to null

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      console.error("Error during login:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        const { user } = currentSession;
        const createUser = async () => {
          const { data: existingUser, error } = await supabase
            .from("users")
            .select("id")
            .eq("id", user?.id)
            .single();

          if (error) {
            console.error("Error checking user:", error.message);
            return;
          }

          if (!existingUser) {
            const { error: insertError } = await supabase.from("users").insert([
              {
                id: user?.id,
                email: user?.email,
                full_name: user?.user_metadata?.full_name || "",
                avatar_url: user?.user_metadata?.avatar_url || "",
              },
            ]);

            if (insertError) {
              console.error("Error inserting user:", insertError.message);
            }
          }
        };

        createUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      {session ? (
        <p>You are logged in! User ID: {session.user?.id}</p>
      ) : (
        <button onClick={handleGoogleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login with Google"}
        </button>
      )}
    </div>
  );
};

export default Login;
