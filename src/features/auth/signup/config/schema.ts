import { z } from "zod";

export type SignUpValidationMessages = {
    nameRequired: string;
    nameMin: string;
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordMin: string;
    passwordUppercase: string;
    passwordLowercase: string;
    passwordNumber: string;
    passwordSpecial: string;
    termsRequired: string;
};

export function createSignUpSchema(messages: SignUpValidationMessages) {
    return z.object({
        name: z
            .string()
            .min(1, messages.nameRequired)
            .min(2, messages.nameMin),
        email: z
            .string()
            .min(1, messages.emailRequired)
            .email(messages.emailInvalid),
        password: z
            .string()
            .min(1, messages.passwordRequired)
            .min(8, messages.passwordMin)
            .regex(/[A-Z]/, messages.passwordUppercase)
            .regex(/[a-z]/, messages.passwordLowercase)
            .regex(/[0-9]/, messages.passwordNumber)
            .regex(/[^A-Za-z0-9]/, messages.passwordSpecial),
        terms: z.literal(true, { message: messages.termsRequired }),
        referralCode: z.string().optional(),
    });
}

export type SignUpFormData = z.infer<ReturnType<typeof createSignUpSchema>>;
