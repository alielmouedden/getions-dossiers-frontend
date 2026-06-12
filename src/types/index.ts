export type UserRole = 'MANAGER' | 'CLERK' | 'SESSION_CLERK' | 'ARCHIVE_OFFICER';

export interface User {
  userId?: number;
  id: string; // Mapped from userId
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone: string;
  active: boolean;
  password?: string;
}

export interface CaseFile {
  id: string;
  folderNumber: string;
  folderSymbol: string;
  createdBy: string;
  creationDate: string;
  statuts?: string;
}

export type TransferStatus = 'PENDING' | 'RECEIVED' | 'COMPLETED' | 'REJECTED' | 'pending' | 'received' | 'completed';

export interface Transfer {
  id: string;
  fromUser: string;
  toUser: string;
  fileId: string;
  status: TransferStatus;
  date: string;
}
