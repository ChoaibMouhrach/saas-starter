import { NotFoundError } from "../lib/error";
import {
  passwordsTable,
  type TPassword,
  type TPasswordsTable,
} from "../database/schema";
import { BaseRepo, BaseRepoInstance } from "../lib/repo";
import { HTTP_ERROR_CODES } from "@saas-starter/shared-constants";

export class PasswordInstance extends BaseRepoInstance<TPasswordsTable> {}

export class PasswordRepo<
  T extends Partial<TPassword> = Partial<TPassword>
> extends BaseRepo<TPasswordsTable, PasswordInstance, T> {
  protected override table = passwordsTable;
  protected override notFoundError = new NotFoundError({
    code: HTTP_ERROR_CODES.PASSWORD_NOT_FOUND,
    message: "password not found",
  });

  public override mapInstance(rec: TPassword): PasswordInstance {
    return new PasswordInstance({
      data: rec,
      repo: new PasswordRepo({ dbClient: this.dbClient }),
    });
  }
}
