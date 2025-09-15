import {
  tokensTable,
  type TToken,
  type TTokensTable,
} from "../database/schema";
import { NotFoundError } from "../lib/error";
import { BaseRepo, BaseRepoInstance } from "../lib/repo";
import { HTTP_ERROR_CODES } from "@saas-starter/shared-constants";
import { UserRepo } from "./user";

export class TokenInstance extends BaseRepoInstance<TTokensTable> {
  public user;

  public constructor(options: { data: TToken; repo: TokenRepo }) {
    super(options);

    this.user = new UserRepo(
      { dbClient: options.repo.dbClient },
      { id: options.data.userId }
    );
  }
}

export class TokenRepo<T extends Partial<TToken> = {}> extends BaseRepo<
  TTokensTable,
  TokenInstance,
  T
> {
  protected override notFoundError = new NotFoundError({
    code: HTTP_ERROR_CODES.TOKEN_NOT_FOUND,
    message: "token doesnt exist",
  });

  protected override table = tokensTable;

  public override mapInstance(data: TToken) {
    return new TokenInstance({
      data,
      repo: this,
    });
  }
}
