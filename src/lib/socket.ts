import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

const getSocketUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://agro.smtsigma.com/api/v1";
  return baseUrl.replace(/\/api\/v1\/?$/, "");
};

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  const token = Cookies.get("accessToken") || "";

  if (!socketInstance) {
    socketInstance = io(getSocketUrl(), {
      auth: { token },
      query: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  } else if (!socketInstance.connected) {
    // Refresh auth token on reconnect if changed
    socketInstance.auth = { token };
    socketInstance.connect();
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
