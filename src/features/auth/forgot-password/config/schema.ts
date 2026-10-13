import { z } from "zod";

export const createForgotPasswordSchema = (t: (key: string) => string) =>
    z.object({
        email: z
            .string()
            .min(1, t("emailRequired"))
            .email(t("emailInvalid")),
    });

export type ForgotPasswordFormData = z.infer<
    ReturnType<typeof createForgotPasswordSchema>
>;
