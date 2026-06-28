import { z } from 'zod';

export const userAddSchema = z.object({
  firstName: z.string().trim().min(1, 'required').regex(/^[^0-9]+$/, 'noNumbers'),
  lastName: z.string().trim().min(1, 'required').regex(/^[^0-9]+$/, 'noNumbers'),
  email: z.string().trim().min(1, 'required').email('invalidEmail'),
  username: z.string().trim().min(1, 'required').min(3, 'minLength3'),
  password: z.string().trim().min(1, 'required').min(6, 'minLength6'),
  role: z.string().trim().min(1, 'required'),
  phone: z.string().trim().min(1, 'required').regex(/^(?:\+212|0)[5-7]\d{8}$/, 'invalidPhone'),
});

export const userEditSchema = userAddSchema.omit({ password: true });

export const fileSchema = z.object({
  folderNumber: z.string().trim().min(1, 'required').regex(/^\d+$/, 'onlyDigits'),
  folderSymbol: z.string().trim().min(1, 'required').regex(/^\d{1,4}$/, 'max4Digits'),
  createdBy: z.string().trim().min(1, 'required'),
});

export const transferSchema = z.object({
  fileId: z.string().trim().min(1, 'required'),
  fromUser: z.string().trim().min(1, 'required'),
  toUser: z.string().trim().min(1, 'required'),
  status: z.string().trim().min(1, 'required'),
  purpose: z.string().optional(),
});

export function validateForm<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  data: Record<string, any>,
  t: (key: string) => string
): { success: boolean; errors: Partial<Record<string, string>> } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, errors: {} };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string;
    if (!errors[field]) {
      errors[field] = t(issue.message);
    }
  }
  return { success: false, errors };
}
