import {
  sessionsTable,
  type TSession,
  type TSessionsTable,
} from "../database/schema";
import { NotFoundError } from "../lib/error";
import { BaseRepo, BaseRepoInstance } from "../lib/repo";
import { HTTP_ERROR_CODES } from "@saas-starter/shared-constants";
import { UserRepo } from "./user";

export class SessionInstance extends BaseRepoInstance<TSessionsTable> {
  public user;

  public constructor(options: { data: TSession; repo: SessionRepo }) {
    super(options);

    this.user = new UserRepo(
      { dbClient: options.repo.dbClient },
      { id: options.data.userId }
    );
  }
}

export class SessionRepo<
  T extends Partial<TSession> = Partial<TSession>
> extends BaseRepo<TSessionsTable, SessionInstance, T> {
  protected override table = sessionsTable;
  protected override notFoundError = new NotFoundError({
    code: HTTP_ERROR_CODES.SESSION_NOT_FOUND,
    message: "session not found",
  });

  public override mapInstance(rec: TSession): SessionInstance {
    return new SessionInstance({
      data: rec,
      repo: this,
    });
  }
}
