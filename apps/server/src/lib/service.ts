import type { Database } from "../repos";
import type { BaseMailer } from "./mailer";

export class BaseService {
  protected database;
  protected tools;

  public constructor(context: {
    database: Database;
    tools: { mailer: BaseMailer };
  }) {
    this.database = context.database;
    this.tools = context.tools;
  }
}
