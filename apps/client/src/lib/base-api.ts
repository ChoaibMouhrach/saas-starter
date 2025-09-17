type RP<T extends Promise<Response>> = Awaited<ReturnType<Awaited<T>["json"]>>;

export class CustomApiError extends Error {
  public statusCode;
  public code;

  public constructor(options: {
    statusCode: number;
    code: string;
    message: string;
  }) {
    super(options.message);

    this.statusCode = options.statusCode;
    this.code = options.code;
  }
}

export class UnexpectedApiError extends Error {}

export class BaseApi {
  public async request<T extends Promise<Response>>(
    cb: () => T
  ): Promise<RP<T>> {
    try {
      const response = await cb();

      if (
        response.ok &&
        (response.headers.get("content-length") === "0" ||
          response.status === 204)
      ) {
        return null as RP<T>;
      }

      const data = await response.json();

      if (response.ok) {
        return data;
      }

      if (!("code" in data)) {
        throw new UnexpectedApiError(response.statusText);
      }

      throw new CustomApiError({
        code: data.code,
        message: data.message,
        statusCode: data.statusCode,
      });
    } catch (err) {
      if (err instanceof CustomApiError || err instanceof UnexpectedApiError) {
        throw err;
      }

      if (err instanceof Error) {
        throw new UnexpectedApiError(err.message);
      }

      throw new UnexpectedApiError();
    }
  }
}
