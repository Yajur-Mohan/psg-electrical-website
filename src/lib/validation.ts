import { z } from "zod";
import { SERVICE_OPTIONS, SIZE_OPTIONS } from "./quote-steps";

// South African numbers: 0XX XXX XXXX or +27 XX XXX XXXX
export const SA_PHONE = /^(\+27|0)\d{9}$/;

export const normalisePhone = (raw: string) => raw.replace(/[\s()-]/g, "");

const phone = z
  .string()
  .transform(normalisePhone)
  .refine((v) => SA_PHONE.test(v), "Please enter a valid phone number, e.g. 082 123 4567");

const values = (opts: { value: string }[]) => opts.map((o) => o.value) as [string, ...string[]];

export const quoteSchema = z.object({
  service: z.enum(values(SERVICE_OPTIONS)),
  size: z.enum(values(SIZE_OPTIONS)),
  phone,
  name: z.string().trim().max(60).optional().default(""),
  sourcePage: z.string().max(100).optional().default("/"),
  // Honeypot: real people never see this field
  company: z.string().max(0, "spam").optional().default(""),
});

export const quoteNoteSchema = z.object({
  id: z.number().int().positive(),
  note: z.string().trim().min(1).max(1000),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  contact: z
    .string()
    .trim()
    .min(5, "Please enter a phone number or email address")
    .max(120)
    .refine(
      (v) => SA_PHONE.test(normalisePhone(v)) || z.email().safeParse(v).success,
      "Please enter a valid phone number or email address",
    ),
  message: z.string().trim().min(10, "Please tell us a little more (10+ characters)").max(2000),
  company: z.string().max(0, "spam").optional().default(""),
});

export const QUERY_STATUSES = ["New", "In Progress", "Converted to Job", "Closed"] as const;
export type QueryStatus = (typeof QUERY_STATUSES)[number];

export const statusSchema = z.object({ status: z.enum(QUERY_STATUSES) });

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(60),
  password: z.string().min(1).max(200),
});
