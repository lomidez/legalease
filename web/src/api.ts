import { ChatResponse } from "./types/chat.ts";

const BASE_URL = import.meta.env.VITE_API_URL as string;

const api = {
  async createChat(): Promise<ChatResponse> {
    const res = await fetch(BASE_URL + `/chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) {
      return Promise.reject({ status: res.status, data });
    }
    return data;
  },

  async sendChatMessage(
    message: string,
  ): Promise<Response["body"]> {
    const res = await fetch(BASE_URL + `/chat/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      return Promise.reject({ status: res.status, data: await res.json() });
    }
    return res.body;
  },
};

export default api;
