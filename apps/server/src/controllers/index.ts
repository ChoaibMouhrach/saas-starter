import { Hono } from "hono";
import { authController } from "./auth";
import type { AppContext } from "../context";

export const controller = new Hono<AppContext>().route("/auth", authController);
