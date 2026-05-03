import { ServerFunctionResponse } from "@/types";

export const handleServerPromise = async (promise: Promise<ServerFunctionResponse>) => {
  const res = await promise;
  if (!res.success) {
    throw new Error(res.message);
  }
  return res.data;
};
