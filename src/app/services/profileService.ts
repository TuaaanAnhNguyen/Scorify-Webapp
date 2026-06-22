// src/app/services/profileService.ts
import { supabaseClient } from "./supabaseClient.ts";

export interface UserProfile {
  id: string;
  name: string | null;
  profile_picture: string | null;
  role: string | null;
  created_at?: string;
  updated_at?: string;
}

export const profileService = {
  async getProfile(profileId: string): Promise<UserProfile> {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error.message);
      throw error;
    }

    if (!data) {
      throw new Error("Không tìm thấy thông tin hồ sơ người dùng.");
    }

    return data as UserProfile;
  },

  async updateProfile(
    profileId: string,
    updates: Partial<Pick<UserProfile, "name" | "role">>,
  ): Promise<UserProfile> {
    const { data, error } = await supabaseClient
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile text data:", error.message);
      throw error;
    }

    return data as UserProfile;
  },

  async uploadProfilePicture(profileId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profileId}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("scorify-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabaseClient.storage
        .from("scorify-assets")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabaseClient
        .from("profiles")
        .update({
          profile_picture: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);

      if (dbError) throw dbError;

      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading profile picture pipeline:", error.message);
      throw error;
    }
  },

  async updatePassword(password: string): Promise<void> {
    const { error } = await supabaseClient.auth.updateUser({ password });
    if (error) {
      console.error("Error updating auth password:", error.message);
      throw error;
    }
  },
};
