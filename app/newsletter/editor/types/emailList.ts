export interface EmailList {
  id: string;
  name: string;
  emails: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

