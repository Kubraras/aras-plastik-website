import { z } from "zod";

const phone = z.string().trim().min(7).max(24).regex(/^\+?[0-9\s().-]+$/, "Geçerli bir telefon numarası girin.");
const optionalEmail = z.union([z.literal(""), z.string().trim().email().max(254)]).optional();

export const contactSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone,
  email: optionalEmail,
  companyName: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(10).max(5000),
  privacyConsent: z.literal("on", "KVKK bilgilendirmesini onaylamanız gerekir."),
  website: z.string().max(0).optional(),
});

export const quoteSchema = z.object({
  submissionToken: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(1_000_000),
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  phone,
  email: optionalEmail,
  companyName: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
  privacyConsent: z.literal("on", "KVKK bilgilendirmesini onaylamanız gerekir."),
  website: z.string().max(0).optional(),
});
