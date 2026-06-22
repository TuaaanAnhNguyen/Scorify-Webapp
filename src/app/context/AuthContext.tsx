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
  refreshProfile: () => Promise<void>;
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

  async function fetchSessionData() {
    try {
      setLoading(true);

      let {
        data: { session },
        error: sessionError,
      } = await supabaseClient.auth.getSession();

      if (!session?.user) {
        const backupAccess = localStorage.getItem("scorify_access_token");
        const backupRefresh = localStorage.getItem("scorify_refresh_token");

        if (backupAccess && backupRefresh) {
          console.log(
            "Re-hydrating Supabase client instance from token fallbacks...",
          );
          const { data: hydratedData, error: hydrateError } =
            await supabaseClient.auth.setSession({
              access_token: backupAccess,
              refresh_token: backupRefresh,
            });

          if (!hydrateError && hydratedData.session) {
            session = hydratedData.session;
          }
        }
      }

      if (sessionError || !session?.user) {
        console.warn("No active session could be resolved.");
        setUser(null);
        setProfile(null);
        setSubscription(null);
        return;
      }

      const authUser = session.user;
      setUser(authUser);

      const { data: profileData, error: profileError } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!profileError && profileData) {
        setProfile(profileData as UserProfile);
      } else {
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
      }

      try {
        const subDataArray = await subscriptionService.getUserSubscription(
          authUser.id,
        );

        console.log("RAW SUBSCRIPTION DATA FROM RPC:", subDataArray);

        setSubscription(
          subDataArray && subDataArray.length > 0
            ? (subDataArray[0] as SubscriptionPlan)
            : null,
        );
      } catch (subErr) {
        console.error("Error fetching subscription data details:", subErr);
        setSubscription(null);
      }
    } catch (err) {
      console.error("Error aggregating AuthContext:", err);
    } finally {
      setLoading(false);
    }
  }

  async function refreshProfileData() {
    if (!user?.id) return;
    try {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (!error && data) {
        setProfile(data as UserProfile);
      }
    } catch (e) {
      console.error(
        "Failed explicitly updating context profile reference node:",
        e,
      );
    }
  }

  useEffect(() => {
    let lastUserId: string | null = null;
    let isInitialMount = true;

    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) lastUserId = session.user.id;
    });

    const {
      data: { subscription: authListener },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "Supabase Auth Event Fired:",
        event,
        "Session User ID:",
        session?.user?.id,
      );

      const currentUserId = session?.user?.id || null;

      if (event === "SIGNED_OUT") {
        lastUserId = null;
        setUser(null);
        setProfile(null);
        setSubscription(null);
        setLoading(false);
        return;
      }

      if (currentUserId !== lastUserId || isInitialMount) {
        isInitialMount = false;
        lastUserId = currentUserId;

        if (currentUserId) {
          await fetchSessionData();
        } else {
          setLoading(false);
        }
      } else {
        if (session?.user) {
          setUser(session.user);
        }
        setLoading(false);
      }
    });

    fetchSessionData().then(() => {
      isInitialMount = false;
    });

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
        refreshProfile: refreshProfileData,
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
