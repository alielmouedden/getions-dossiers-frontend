import { User, CaseFile, Transfer } from '@/types';

export const mockUsers: User[] = [
  { id: '1', username: 'ahmed.m', firstName: 'أحمد', lastName: 'محمدي', email: 'ahmed@justice.gov.ma', role: 'admin', phone: '0612345678', active: true },
  { id: '2', username: 'fatima.b', firstName: 'فاطمة', lastName: 'بنعلي', email: 'fatima@justice.gov.ma', role: 'employee', phone: '0623456789', active: true },
  { id: '3', username: 'youssef.k', firstName: 'يوسف', lastName: 'الكريمي', email: 'youssef@justice.gov.ma', role: 'consultant', phone: '0634567890', active: true },
  { id: '4', username: 'amina.s', firstName: 'أمينة', lastName: 'السعدي', email: 'amina@justice.gov.ma', role: 'employee', phone: '0645678901', active: false },
  { id: '5', username: 'omar.h', firstName: 'عمر', lastName: 'الحسني', email: 'omar@justice.gov.ma', role: 'employee', phone: '0656789012', active: true },
];

export const mockFiles: CaseFile[] = [
  { id: '1', fileNumber: 'F-2024-001', folderNumber: 'D-100', createdBy: 'أحمد محمدي', creationDate: '2024-01-15' },
  { id: '2', fileNumber: 'F-2024-002', folderNumber: 'D-101', createdBy: 'فاطمة بنعلي', creationDate: '2024-02-20' },
  { id: '3', fileNumber: 'F-2024-003', folderNumber: 'D-102', createdBy: 'يوسف الكريمي', creationDate: '2024-03-10' },
  { id: '4', fileNumber: 'F-2024-004', folderNumber: 'D-103', createdBy: 'أمينة السعدي', creationDate: '2024-04-05' },
  { id: '5', fileNumber: 'F-2024-005', folderNumber: 'D-104', createdBy: 'عمر الحسني', creationDate: '2024-05-12' },
];

export const mockTransfers: Transfer[] = [
  { id: '1', fromUser: 'أحمد محمدي', toUser: 'فاطمة بنعلي', fileId: 'F-2024-001', status: 'completed', date: '2024-02-01' },
  { id: '2', fromUser: 'فاطمة بنعلي', toUser: 'يوسف الكريمي', fileId: 'F-2024-002', status: 'pending', date: '2024-03-15' },
  { id: '3', fromUser: 'يوسف الكريمي', toUser: 'أمينة السعدي', fileId: 'F-2024-003', status: 'received', date: '2024-04-20' },
  { id: '4', fromUser: 'عمر الحسني', toUser: 'أحمد محمدي', fileId: 'F-2024-004', status: 'pending', date: '2024-05-10' },
];
