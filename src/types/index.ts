export type UserRole = 'admin' | 'employee' | 'consultant';

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone: string;
  active: boolean;
}

export interface CaseFile {
  id: string;
  fileNumber: string;
  folderNumber: string;
  createdBy: string;
  creationDate: string;
}

export type TransferStatus = 'pending' | 'received' | 'completed';

export interface Transfer {
  id: string;
  fromUser: string;
  toUser: string;
  fileId: string;
  status: TransferStatus;
  date: string;
}
