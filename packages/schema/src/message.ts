import { z } from "zod";

export const Conversation = z.object({
  id: z.string().uuid(),
  listingId: z.string().uuid().nullable(),
  participants: z.array(z.string().uuid()).min(2),
  lastMessageAt: z.string().nullable(),
  createdAt: z.string(),
});
export type Conversation = z.infer<typeof Conversation>;

export const Message = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  senderId: z.string().uuid(),
  body: z.string().min(1).max(10000),
  attachments: z.array(z.string().url()).default([]),
  sentByAgent: z.boolean().default(false),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});
export type Message = z.infer<typeof Message>;

export const NewMessage = z.object({
  conversationId: z.string().uuid().optional(),
  listingId: z.string().uuid().optional(),
  recipientId: z.string().uuid().optional(),
  body: z.string().min(1).max(10000),
  attachments: z.array(z.string().url()).optional(),
}).refine((d) => d.conversationId || (d.listingId && d.recipientId) || d.recipientId, {
  message: "Provide conversationId, or recipientId (with optional listingId) to start a thread",
});
export type NewMessage = z.infer<typeof NewMessage>;
