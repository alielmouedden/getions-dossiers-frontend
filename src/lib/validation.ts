import { z } from 'zod';

export const userAddSchema = z.object({
  firstName: z.string().trim().min(1, 'required'),
  lastName: z.string().trim().min(1, 'required'),
  email: z.string().trim().min(1, 'required').email('invalidEmail'),
  username: z.string().trim().min(1, 'required').min(3, 'minLength3'),
  password: z.string().trim().min(1, 'required').min(6, 'minLength6'),
  role: z.enum(['admin', 'employee', 'consultant']),
  phone: z.string().trim().min(1, 'required'),
});

export const userEditSchema = userAddSchema.omit({ password: true });

export const fileSchema = z.object({
  fileNumber: z.string().trim().min(1, 'required'),
  folderNumber: z.string().trim().min(1, 'required'),
  createdBy: z.string().trim().min(1, 'required'),
});

export const transferSchema = z.object({
  fileId: z.string().trim().min(1, 'required'),
  fromUser: z.string().trim().min(1, 'required'),
  toUser: z.string().trim().min(1, 'required'),
  status: z.enum(['pending', 'received', 'completed']),
});

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export function validateForm<T extends z.ZodObject<any>>(
  schema: T,
  data: Record<string, any>,
  t: (key: string) => string
): { success: boolean; errors: FormErrors<z.infer<T>> } {
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
