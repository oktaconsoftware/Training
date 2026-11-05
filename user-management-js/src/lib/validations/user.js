import { z } from "zod";
const optionalText = (max) => z.string().trim().max(max).optional().nullable().transform((value) => {
    if (value === undefined || value === null || value === "")
        return null;
    return value;
});
export const createUserSchema = z.object({
    name: z.string().trim().min(2, "Name must contain at least 2 characters").max(150),
    email: z.string().trim().email("Enter a valid email address").max(255),
    phone: optionalText(30),
    age: z.number().int().min(0, "Age cannot be negative").max(130, "Enter a valid age").optional().nullable(),
});
export const updateUserSchema = createUserSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
});
