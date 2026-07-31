export type ContactMessageStatus = "new" | "read" | "replied" | "archived" | "spam";
export type ContactPriority = "low" | "normal" | "high";
export type ContactNotificationStatus = "pending" | "sent" | "failed" | "skipped";

export type ContactMessage = {
  id: string;
  fullName: string;
  email: string;
  company?: string;
  subject: string;
  interest: string;
  message: string;
  sourcePage: string;
  status: ContactMessageStatus;
  priority: ContactPriority;
  adminNotes?: string;
  notificationStatus: ContactNotificationStatus;
  notificationProviderId?: string;
  notificationError?: string;
  notificationAttemptedAt?: string;
  readAt?: string;
  repliedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactInboxCounts = {
  total: number;
  unread: number;
  replied: number;
  archived: number;
  spam: number;
  notificationFailures: number;
};

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<"fullName" | "email" | "subject" | "interest" | "message", string>>;
};
