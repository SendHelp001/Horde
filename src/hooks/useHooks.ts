// src/hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient'; // Import your existing supabase client

const AuthContext = createContext<{
  user: any | null;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}>({
  user: null,
  isAuthenticated: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsAuthenticated(!!session);
        setUser(session?.user || null);

        if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          await upsertUser(session.user);
          history.push('/feed/home'); // Navigate using react-router-dom
        } else if (!session) {
          history.push('/login'); // Navigate using react-router-dom
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Error signing in with Google:', error);
      // Handle error appropriately (e.g., show a toast)
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setIsAuthenticated(false);
      setUser(null);
      history.replace('/login'); // Navigate using react-router-dom with 'replace' to prevent going back
    } else {
      console.error('Error signing out:', error);
      // Handle error
    }
  };

  const upsertUser = async (user: any) => {
    const { error } = await supabase
      .from('users')
      .upsert(
        {
          id: user.id, // Assuming user.id from Supabase Auth is the primary key
          email: user.email,
          // Add other relevant user data you might want to store
        },
        { onConflict: 'id' } // If ID exists, update; otherwise, insert
      );

    if (error) {
      console.error('Error upserting user:', error);
    } else {
      console.log('User upserted successfully:', user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};