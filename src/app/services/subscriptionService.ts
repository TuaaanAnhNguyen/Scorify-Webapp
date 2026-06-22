// src/app/services/subscriptionService.ts
import { supabaseClient } from "./supabaseClient.ts";

export interface SubscriptionPlan {
  plan_id: string;
  plan_name: string;
  price: number;
  file_size_limit: number;
  submission_limit: number;
  billing_period: string;
  status?: string;
}

export interface UserSubscription {
  user_subscription_id: string;
  profile_id: string;
  plan_id: string;
  start_date: string;
  end_date: string | null;
  status: "active" | "cancelled" | "expired" | "inactive";
}

export interface BillingHistoryRecord {
  user_subscription_id: string;
  start_date: string;
  end_date: string | null;
  status: string;
  subscription_plan: {
    name: string;
    price: number;
    billing_period: string;
  } | null;
}

export const subscriptionService = {
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabaseClient.rpc(
      "stored_proc_list_subscription_plans_v2",
    );

    if (error) {
      console.error("Error fetching subscription plans:", error.message);
      throw error;
    }
    return data as SubscriptionPlan[];
  },

  async getUserSubscription(profileId: string): Promise<any[]> {
    const { data, error } = await supabaseClient.rpc(
      "stored_proc_get_user_subscription_v2",
      {
        p_profile_id: profileId,
      },
    );

    if (error) {
      console.error("Error fetching user subscription details:", error.message);
      throw error;
    }
    return data;
  },

  async upsertUserSubscription(params: {
    p_profile_id: string;
    p_plan_id: string;
    p_start_date: string;
    p_end_date?: string;
  }): Promise<string> {
    const { data, error } = await supabaseClient.rpc(
      "stored_proc_upsert_user_subscription_v2",
      params,
    );

    if (error) {
      console.error("Error upserting user subscription:", error.message);
      throw error;
    }
    return data as string;
  },

  async cancelSubscription(profileId: string): Promise<void> {
    const { error } = await supabaseClient.rpc("cancel_user_subscription", {
      p_profile_id: profileId,
    });

    if (error) {
      console.error("Error cancelling subscription:", error.message);
      throw error;
    }
  },

  async getBillingHistory(profileId: string): Promise<BillingHistoryRecord[]> {
    const { data, error } = await supabaseClient
      .from("user_subscription")
      .select(
        `
        user_subscription_id,
        start_date,
        end_date,
        status,
        subscription_plan:plan_id (
          name,
          price,
          billing_period
        )
      `,
      )
      .eq("profile_id", profileId)
      .order("start_date", { ascending: false });

    if (error) {
      console.error(
        "Error query from user_subscription ledger table:",
        error.message,
      );
      throw error;
    }

    return (data as unknown as BillingHistoryRecord[]) || [];
  },

  async getUserModelOption(profileId: string): Promise<string> {
    const { data, error } = await supabaseClient
      .from("user_subscription")
      .select(
        `
        status,
        subscription_plan:plan_id (
          model_option
        )
      `,
      )
      .eq("profile_id", profileId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error(
        "Error querying model_option from database:",
        error.message,
      );
      return "Scorify Medium";
    }

    const rawResult = data as any;
    const modelOption = rawResult?.subscription_plan?.model_option;
    console.log(`\n This user uses the model: ${modelOption} \n`);
    return modelOption || "Scorify Medium";
  },
};
