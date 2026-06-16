// src/app/context/AuthContext.tsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabaseClient } from "../services/supabaseClient";
import {
  subscriptionService,
  SubscriptionPlan,
} from "../services/subscriptionService";

// Type mappings matching your PostgreSQL definitions
export interface UserProfile {
  id: string;
  name: string | null;
  profile_picture: string | null;
  role: string | null;
}

export interface AuthContextType {
  user: any | null; // Supabase Core Auth User
  profile: UserProfile | null; // public.profiles row
  subscription: SubscriptionPlan | null; // Joined active subscription_plan details
  loading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // Modular engine to synchronize context state with live Supabase storage data
  async function fetchSessionData() {
    try {
      setLoading(true);

      // 1. Get current authenticated core user credentials
      const {
        data: { session },
        error: sessionError,
      } = await supabaseClient.auth.getSession();

      if (sessionError || !session?.user) {
        console.warn("No active session found");
        setUser(null);
        setProfile(null);
        setSubscription(null);
        return;
      }

      const authUser = session.user;
      setUser(authUser);

      // 2. Load custom user profile metadata row
      const { data: profileData, error: profileError } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!profileError && profileData) {
        setProfile(profileData as UserProfile);
      } else {
        // Parse the local storage backup saved in authService if user_metadata isn't hydrated yet
        const localUserStr = localStorage.getItem("scorify_user");
        let cachedMetadata = null;
        try {
          if (localUserStr) {
            const parsed = JSON.parse(localUserStr);
            cachedMetadata = parsed.user_metadata || parsed.raw_user_meta_data;
          }
        } catch (e) {
          console.error("Failed parsing fallback local storage user:", e);
        }

        setProfile({
          id: authUser.id,
          name:
            cachedMetadata?.full_name ||
            cachedMetadata?.name ||
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            "Who?",
          profile_picture:
            cachedMetadata?.avatar_url ||
            cachedMetadata?.profile_picture ||
            authUser.user_metadata?.avatar_url ||
            null,
          role:
            cachedMetadata?.role || authUser.user_metadata?.role || "teacher",
        });
      } // 🎯 FIXED: This closing bracket was missing, which broke the try-catch alignment below!

      // 3. Fetch active user subscription plan via your existing service RPC method
      const subDataArray = await subscriptionService.getUserSubscription(
        authUser.id,
      );
      setSubscription(
        subDataArray && subDataArray.length > 0
          ? (subDataArray[0] as SubscriptionPlan)
          : null,
      );
    } catch (err) {
      console.error("Error aggregating AuthContext:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Listen to real-time auth changes (Sign In, Sign Out, Token Refreshing)
    const {
      data: { subscription: authListener },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "Supabase Auth Event Fired:",
        event,
        "Session User ID:",
        session?.user?.id,
      );

      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        session?.user
      ) {
        await fetchSessionData();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setSubscription(null);
        setLoading(false);
      }
    });

    // Initial pull down logic
    fetchSessionData();

    return () => {
      authListener.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabaseClient.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
        loading,
        refreshSession: fetchSessionData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth must be wrapped within an AuthProvider root element context",
    );
  }
  return context;
}
