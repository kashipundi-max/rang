import { z } from "zod";

export type SignInValidationMessages = {
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
};

export function createSignInSchema(messages: SignInValidationMessages) {
    return z.object({
        email: z
            .string()
            .min(1, messages.emailRequired)
            .email(messages.emailInvalid),
        password: z.string().min(1, messages.passwordRequired),
        rememberMe: z.boolean().optional(),
    });
}

export type SignInFormData = z.infer<ReturnType<typeof createSignInSchema>>;
