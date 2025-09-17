import { hc } from "hono/client";
import type { TApp } from "@server/app";
import { env } from "./env";

export const apiClient = hc<TApp>(env.VITE_API_URL, {
  init: {
    credentials: "include",
  },
});
