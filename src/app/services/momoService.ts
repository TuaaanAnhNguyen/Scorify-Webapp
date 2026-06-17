// src/app/services/momoService.ts
import { supabaseClient } from "./supabaseClient";

export const momoService = {
  async requestWithRetry(userId: string, amount: number, planId: string, isTeacherWorkspace: boolean, retries = 2): Promise<any> {
    try {
      const { data, error } = await supabaseClient.functions.invoke('momo-create-order', {
        body: { 
          userId, 
          amount, 
          subscriptionType: planId, 
          isTeacherWorkspace,
          // 🎯 Đảm bảo truyền chính xác URL hiện tại kèm path (ví dụ: localhost:5173/workspace/pricing)
          redirectUrl: `${window.location.origin}${window.location.pathname}?status=success`
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      if (retries > 0) {
        console.warn(`[MoMo Service] Gặp lỗi mạng, đang tự động thử lại... (Còn ${retries} lần thử)`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return this.requestWithRetry(userId, amount, planId, isTeacherWorkspace, retries - 1);
      }
      throw error;
    }
  },

  async requestPaymentLink(userId: string, amount: number, planId: string, isTeacherWorkspace: boolean) {
    try {
      return await this.requestWithRetry(userId, amount, planId, isTeacherWorkspace, 2);
    } catch (error) {
      console.error("Lỗi kết nối Edge Function MoMo sau khi đã thử lại:", error);
      throw error;
    }
  }
};