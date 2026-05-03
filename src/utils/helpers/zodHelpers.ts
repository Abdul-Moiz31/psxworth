import { z } from "zod";

const safeNumberPreprocessor = (val: unknown) => {
  if (typeof val === "string" && val.trim() === "") return undefined;
  const num = Number(val);
  return isNaN(num) ? undefined : num;
};

export const createPositiveNumberSchema = (options: {
  fieldName: string;
  max?: number;
  min?: number;
}) => {
  const { fieldName, max, min = 0 } = options;

  return z.preprocess(
    safeNumberPreprocessor,
    z
      .number({
        required_error: `${fieldName} is required`,
        invalid_type_error: `${fieldName} must be a valid number`,
      })
      .min(min, `${fieldName} must be greater than ${min}`)
      .max(max ?? Number.MAX_SAFE_INTEGER, `${fieldName} cannot exceed ${max}`)
  );
};
