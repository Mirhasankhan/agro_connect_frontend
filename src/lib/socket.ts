import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

export const getSocketUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://agro.smtsigma.com/api/v1";
  return baseUrl.replace(/\/api\/v1\/?$/, "");
};

export const getAuthToken = (): string => {
  if (typeof window === "undefined") return "";

  // 1. Try Cookies (support both accessToken and token)
  const cookieToken = Cookies.get("accessToken") || Cookies.get("token");
  if (cookieToken && cookieToken !== "undefined" && cookieToken !== "null") {
    return cookieToken.trim();
  }

  // 2. Try localStorage persisted auth (redux-persist)
  try {
    const persisted = localStorage.getItem("persist:auth");
    if (persisted) {
      const parsed = JSON.parse(persisted);
      if (parsed.token) {
        const raw =
          typeof parsed.token === "string" &&
          (parsed.token.startsWith('"') || parsed.token.startsWith("{"))
            ? JSON.parse(parsed.token)
            : parsed.token;
        if (raw && raw !== "undefined" && raw !== "null") {
          return String(raw).trim();
        }
      }
    }
  } catch {
    // ignore
  }

  return "";
};

let socketInstance: Socket | null = null;
let lastUsedToken: string = "";

export const getSocket = (): Socket => {
  const token = getAuthToken();
  const socketUrl = getSocketUrl();

  if (!socketInstance) {
    socketInstance = io(socketUrl, {
      auth: (cb) => {
        cb({ token: getAuthToken() });
      },
      query: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    lastUsedToken = token;
  } else {
    // If token has changed or was empty initially and is now populated, reconnect
    socketInstance.auth = { token };
    if (socketInstance.io && socketInstance.io.opts) {
      socketInstance.io.opts.query = { token };
    }

    if (token && lastUsedToken !== token) {
      lastUsedToken = token;
      if (socketInstance.connected) {
        socketInstance.disconnect();
      }
      socketInstance.connect();
    } else if (!socketInstance.connected) {
      socketInstance.connect();
    }
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    lastUsedToken = "";
  }
};
