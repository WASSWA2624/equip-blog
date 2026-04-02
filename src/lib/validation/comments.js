import { z } from "zod";

export const commentModerationStatusValues = Object.freeze([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SPAM",
]);

export const commentBodyMaxLength = 3000;

function createRequiredStringSchema(fieldName) {
  return z.string().trim().min(1, {
    message: `${fieldName} is required.`,
  });
}

function createOptionalStringSchema() {
  return z.preprocess((value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value === "string") {
      const trimmedValue = value.trim();

      return trimmedValue ? trimmedValue : undefined;
    }

    return value;
  }, z.string().trim().optional());
}

function createEnumStringSchema(fieldName, values) {
  const allowedValues = new Set(values);

  return createRequiredStringSchema(fieldName).refine((value) => allowedValues.has(value), {
    message: `${fieldName} must be one of: ${values.join(", ")}.`,
  });
}

export const commentSubmissionSchema = z
  .object({
    body: createRequiredStringSchema("body").max(commentBodyMaxLength, {
      message: `body must be at most ${commentBodyMaxLength} characters.`,
    }),
    email: z.preprocess((value) => {
      if (value === undefined || value === null) {
        return undefined;
      }

      if (typeof value === "string") {
        const trimmedValue = value.trim();

        return trimmedValue ? trimmedValue : undefined;
      }

      return value;
    }, z.string().trim().email({ message: "email must be a valid email address." }).optional()),
    name: createRequiredStringSchema("name"),
    parentId: createOptionalStringSchema(),
    postId: createRequiredStringSchema("postId"),
  })
  .strict();

export const commentModerationUpdateSchema = z
  .object({
    moderationStatus: createEnumStringSchema(
      "moderationStatus",
      commentModerationStatusValues,
    ),
  })
  .strict();
