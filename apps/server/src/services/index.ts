import type { BaseMailer } from "../lib/mailer";
import type { Database } from "../repos";
import { AuthService } from "./auth";

export class Service {
  public auth;

  public constructor(context: {
    database: Database;
    tools: { mailer: BaseMailer };
  }) {
    this.auth = new AuthService(context);
  }
}
