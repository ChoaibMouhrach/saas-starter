import { AuthApi } from "./auth";

export class Api {
  public auth;

  public constructor() {
    this.auth = new AuthApi();
  }

  public static new() {
    return new this();
  }
}

export const api = Api.new();
