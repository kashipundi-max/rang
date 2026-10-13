import { z } from "zod";

// Validation messages factory for i18n support
export const createContactSchema = (messages: {
  nameRequired: string;
  nameMin: string;
  nameMax: string;
  emailRequired: string;
  emailInvalid: string;
  subjectRequired: string;
  subjectMin: string;
  subjectMax: string;
  messageRequired: string;
  messageMin: string;
  messageMax: string;
  phoneInvalid: string;
}) => {
  return z.object({
    name: z
      .string()
      .min(1, messages.nameRequired)
      .min(2, messages.nameMin)
      .max(100, messages.nameMax),
    email: z
      .string()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(val),
        { message: messages.phoneInvalid }
      ),
    subject: z
      .string()
      .min(1, messages.subjectRequired)
      .min(5, messages.subjectMin)
      .max(200, messages.subjectMax),
    message: z
      .string()
      .min(1, messages.messageRequired)
      .min(20, messages.messageMin)
      .max(2000, messages.messageMax),
  });
};

export type ContactFormData = z.infer<ReturnType<typeof createContactSchema>>;
