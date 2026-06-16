// src/app/services/authService.ts

import { supabaseClient } from "./supabaseClient.ts";

export interface LoginPayload {
  emailOrPhone: string;
  password?: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password?: string;
  retypePassword?: string;
  birthday: string;
}

export const authService = {
  async login(payload: LoginPayload) {
    console.log("Login attempt for:", payload.emailOrPhone);

    const { data, error } = await supabaseClient.functions.invoke("login", {
      body: payload,
    });

    console.log("Edge Function Full Response:", { data, error });

    if (error) {
      console.error("Edge login error:", error);
      throw new Error(error.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    }

    if (!data) {
      throw new Error("No data returned from login function");
    }

    // Extract tokens — they are inside .session
    const accessToken = data.session?.access_token;
    const refreshToken = data.session?.refresh_token;
    const userData = data.user || data.session?.user;

    if (!accessToken || !refreshToken) {
      console.error("Missing tokens in response:", data);
      throw new Error("Invalid session data received from server");
    }

    try {
      // Set Supabase session (critical for auth listeners)
      await supabaseClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      // Backup to localStorage (your fallback mechanism)
      localStorage.setItem("scorify_access_token", accessToken);
      localStorage.setItem("scorify_refresh_token", refreshToken);
      localStorage.setItem("scorify_user", JSON.stringify(userData || data));

      console.log("Login successful - Session & localStorage updated");
    } catch (setSessionError) {
      console.error("Failed to set Supabase session:", setSessionError);
      // Still save to localStorage as fallback
      localStorage.setItem("scorify_access_token", accessToken);
      localStorage.setItem("scorify_refresh_token", refreshToken);
      localStorage.setItem("scorify_user", JSON.stringify(userData || data));
    }

    return data;
  },

  async register(payload: RegisterPayload) {
    const { data, error } = await supabaseClient.functions.invoke("register", {
      body: payload,
    });

    if (error) {
      console.error("Edge registration error object:", error);
      throw new Error(error.message || "Đăng ký tài khoản thất bại.");
    }

    return data;
  },

  async logout(): Promise<void> {
    await supabaseClient.auth.signOut();
    localStorage.removeItem("scorify_access_token");
    localStorage.removeItem("scorify_refresh_token");
    localStorage.removeItem("scorify_user");
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("scorify_access_token");
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("scorify_user");
    return userStr ? JSON.parse(userStr) : null;
  },
};
