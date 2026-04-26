import { ResultConstants } from "@/constants";

export type Result = {
  isSucceed: boolean;
  message?: string;
  error?: Error;
};

export const Result = {
  withMessage(message: string): Result {
    return { isSucceed: true, message };
  },
  withError(errorMsg: string): Result {
    return { isSucceed: false, message: errorMsg };
  },
};

export type ResultOf<T> = Result & { value?: T };

export const ResultOf = {
  withValue<T>(value: T): ResultOf<T> {
    return { isSucceed: true, value };
  },
  notFound(resourceName: string): ResultOf<never> {
    return {
      isSucceed: true,
      message: ResultConstants.NotFound.replace("{0}", resourceName),
    };
  },
  withError<T>(error: Error): ResultOf<T> {
    return { isSucceed: false, error } as ResultOf<T>;
  },
};
