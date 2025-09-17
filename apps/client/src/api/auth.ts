import { apiClient } from "@/lib/rpc";
import { BaseApi } from "@/lib/base-api";
import type { InferRequestType } from "hono";

export class AuthApi extends BaseApi {
  public signIn(payload: SignInPayload) {
    return this.request(() => {
      return signInApi(payload);
    });
  }

  public requestPasswordReset(payload: RequestPasswordResetPayload) {
    return this.request(() => {
      return requestPasswordResetApi(payload);
    });
  }

  public resetPassword(payload: ResetPasswordPayload) {
    return this.request(() => {
      return resetPasswordApi(payload);
    });
  }

  public signUp(payload: SignUpPayload) {
    return this.request(() => {
      return signUpApi(payload);
    });
  }

  public signOut() {
    return this.request(() => {
      return apiClient.api.auth["sign-out"].$post();
    });
  }

  public getAuthUser() {
    return this.request(() => {
      return apiClient.api.auth["user"].$get();
    });
  }

  public changePassword(payload: ChangePasswordPayload) {
    return this.request(() => changePassword(payload));
  }

  public requestEmailChange(payload: RequestEmailChangePayload) {
    return this.request(() => requestEmailChange(payload));
  }
}

const signInApi = apiClient.api.auth["sign-in"].$post;
type SignInPayload = InferRequestType<typeof signInApi>;

const signUpApi = apiClient.api.auth["sign-up"].$post;
type SignUpPayload = InferRequestType<typeof signUpApi>;

const requestPasswordResetApi =
  apiClient.api.auth["request-password-reset"].$post;
type RequestPasswordResetPayload = InferRequestType<
  typeof requestPasswordResetApi
>;

const resetPasswordApi = apiClient.api.auth["reset-password"].$post;
type ResetPasswordPayload = InferRequestType<typeof resetPasswordApi>;

const requestEmailChange = apiClient.api.auth["request-email-change"].$post;
type RequestEmailChangePayload = InferRequestType<typeof requestEmailChange>;

const changePassword = apiClient.api.auth["change-password"].$post;
type ChangePasswordPayload = InferRequestType<typeof changePassword>;
