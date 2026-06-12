import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { transferSchema, validateForm } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTransfers, useUsers, useFiles } from '@/hooks/use-api';
import { useAuth } from '@/contexts/AuthContext';
import { Transfer, TransferStatus } from '@/types';

const TransfersPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { transfers, isLoading, addTransfer, updateTransfer, deleteTransfer } = useTransfers('me');
  const { users } = useUsers();
  const { files } = useFiles();
  
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [form, setForm] = useState({ fromUser: '', toUser: '', fileId: '', status: 'PENDING' as TransferStatus });
  const [editForm, setEditForm] = useState({ fromUser: '', toUser: '', fileId: '', status: 'PENDING' as TransferStatus });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    let result = transfers;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(tr =>
        tr.fromUser.toLowerCase().includes(q) ||
        tr.toUser.toLowerCase().includes(q) ||
        tr.fileId.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(tr => tr.status === statusFilter.toLowerCase());
    }
    return result;
  }, [transfers, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleStatusFilter = (val: string) => { setStatusFilter(val); setPage( page === 1 ? 1 : 1); };

  const handleAdd = () => {
    const { success, errors: validationErrors } = validateForm(transferSchema, form, t);
    if (!success) { setErrors(validationErrors); return; }
    
    const folder = files.find(f => f.folderNumber === form.fileId);
    const fromUser = users.find(u => `${u.firstName} ${u.lastName}` === form.fromUser);
    const toUser = users.find(u => `${u.firstName} ${u.lastName}` === form.toUser);

    const transferData = {
      folder: folder ? { folderId: Number(folder.id) } : null,
      fromUser: fromUser ? { userId: Number(fromUser.id) } : null,
      toUser: toUser ? { userId: Number(toUser.id) } : null,
      purpose: 'Transfer Request',
      transferDate: new Date().toISOString().split('T')[0],
      requestTransfer: true
    };

    addTransfer(transferData, {
      onSuccess: () => {
        setOpen(false);
        setForm({ fromUser: '', toUser: '', fileId: '', status: 'PENDING' });
        setErrors({});
        toast({ title: t('transferAdded') });
      },
      onError: () => toast({ title: t('error'), variant: 'destructive' })
    });
  };

  const handleEdit = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setEditForm({ fromUser: transfer.fromUser, toUser: transfer.toUser, fileId: transfer.fileId, status: transfer.status as TransferStatus });
    setEditErrors({});
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!selectedTransfer) return;
    const { success, errors: validationErrors } = validateForm(transferSchema, editForm, t);
    if (!success) { setEditErrors(validationErrors); return; }
    
    const folder = files.find(f => f.folderNumber === editForm.fileId);
    const fromUser = users.find(u => `${u.firstName} ${u.lastName}` === editForm.fromUser);
    const toUser = users.find(u => `${u.firstName} ${u.lastName}` === editForm.toUser);

    const transferData = {
      folder: folder ? { folderId: Number(folder.id) } : null,
      fromUser: fromUser ? { userId: Number(fromUser.id) } : null,
      toUser: toUser ? { userId: Number(toUser.id) } : null,
      purpose: 'Transfer Update',
      transferDate: new Date().toISOString().split('T')[0],
      status: editForm.status
    };

    updateTransfer({ id: selectedTransfer.id, transfer: transferData }, {
      onSuccess: () => {
        setEditOpen(false);
        setSelectedTransfer(null);
        setEditErrors({});
        toast({ title: t('transferUpdated') });
      },
      onError: () => toast({ title: t('error'), variant: 'destructive' })
    });
  };

  const handleDeleteClick = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedTransfer) return;
    deleteTransfer(selectedTransfer.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setSelectedTransfer(null);
        toast({ title: t('transferDeleted') });
      },
      onError: () => toast({ title: t('error'), variant: 'destructive' })
    });
  };

  const { user } = useAuth();
  const isAdmin = user?.role === 'MANAGER' || (user?.roles && (user.roles.includes('ROLE_MANAGER') || user.roles.includes('MANAGER')));

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    const styles: Record<string, string> = {
      completed: 'bg-success/10 text-success border-success/20',
      pending: 'bg-warning/10 text-warning border-warning/20',
      received: 'bg-info/10 text-info border-info/20',
      rejected: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return <Badge variant="outline" className={styles[s] || ''}>{t(s)}</Badge>;
  };

  const FieldError = ({ error }: { error?: string }) => error ? <p className="text-xs text-destructive mt-1">{error}</p> : null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{t('transferManagement')}</h2>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> {t('export')}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => {
                const headers = [
                  { key: 'id', label: t('transferId') }, { key: 'fromUser', label: t('fromUser') },
                  { key: 'toUser', label: t('toUser') }, { key: 'fileId', label: t('file') },
                  { key: 'statusTrans', label: t('status') }, { key: 'date', label: t('date') },
                ];
                const translatedData = filtered.map(tr => ({
                  ...tr,
                  statusTrans: t(tr.status.toLowerCase())
                }));
                exportToCSV(translatedData as unknown as Record<string, string>[], headers, 'transfers');
              }}>
                <FileSpreadsheet className="w-4 h-4 me-2" /> {t('exportCSV')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                const headers = [
                  { key: 'id', label: t('transferId') }, { key: 'fromUser', label: t('fromUser') },
                  { key: 'toUser', label: t('toUser') }, { key: 'fileId', label: t('file') },
                  { key: 'statusTrans', label: t('status') }, { key: 'date', label: t('date') },
                ];
                const translatedData = filtered.map(tr => ({
                  ...tr,
                  statusTrans: t(tr.status.toLowerCase())
                }));
                await exportToPDF(translatedData as unknown as Record<string, string>[], headers, 'transfers', t('transferManagement'));
              }}>
                <FileText className="w-4 h-4 me-2" /> {t('exportPDF')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setErrors({}); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> {t('addTransfer')}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t('addTransfer')}</DialogTitle>
                <DialogDescription className="sr-only">{t('addTransfer')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>{t('selectFile')}</Label>
                  <Select value={form.fileId} onValueChange={(v) => setForm({ ...form, fileId: v })}>
                    <SelectTrigger className={errors.fileId ? 'border-destructive' : ''}><SelectValue placeholder={t('selectFile')} /></SelectTrigger>
                    <SelectContent>{files.map((f) => (<SelectItem key={f.id} value={f.folderNumber}>{f.folderNumber}</SelectItem>))}</SelectContent>
                  </Select>
                  <FieldError error={errors.fileId} />
                </div>
                <div className="space-y-1">
                  <Label>{t('fromUser')}</Label>
                  <Select value={form.fromUser} onValueChange={(v) => setForm({ ...form, fromUser: v })}>
                    <SelectTrigger className={errors.fromUser ? 'border-destructive' : ''}><SelectValue placeholder={t('selectUser')} /></SelectTrigger>
                    <SelectContent>{users.map((u) => (<SelectItem key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</SelectItem>))}</SelectContent>
                  </Select>
                  <FieldError error={errors.fromUser} />
                </div>
                <div className="space-y-1">
                  <Label>{t('toUser')}</Label>
                  <Select value={form.toUser} onValueChange={(v) => setForm({ ...form, toUser: v })}>
                    <SelectTrigger className={errors.toUser ? 'border-destructive' : ''}><SelectValue placeholder={t('selectUser')} /></SelectTrigger>
                    <SelectContent>{users.map((u) => (<SelectItem key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</SelectItem>))}</SelectContent>
                  </Select>
                  <FieldError error={errors.toUser} />
                </div>
                <div className="space-y-1">
                  <Label>{t('status')}</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TransferStatus })}>
                    <SelectTrigger className={errors.status ? 'border-destructive' : ''}><SelectValue placeholder={t('selectStatus')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">{t('pending')}</SelectItem>
                      <SelectItem value="RECEIVED">{t('received')}</SelectItem>
                      <SelectItem value="COMPLETED">{t('completed')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError error={errors.status} />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAdd} className="flex-1">{t('save')}</Button>
                  <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">{t('cancel')}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) setEditErrors({}); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('editTransfer')}</DialogTitle>
            <DialogDescription className="sr-only">{t('editTransfer')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>{t('selectFile')}</Label>
              <Select value={editForm.fileId} onValueChange={(v) => setEditForm({ ...editForm, fileId: v })}>
                <SelectTrigger className={editErrors.fileId ? 'border-destructive' : ''}><SelectValue /></SelectTrigger>
                <SelectContent>{files.map((f) => (<SelectItem key={f.id} value={f.folderNumber}>{f.folderNumber}</SelectItem>))}</SelectContent>
              </Select>
              <FieldError error={editErrors.fileId} />
            </div>
            <div className="space-y-1">
              <Label>{t('fromUser')}</Label>
              <Select value={editForm.fromUser} onValueChange={(v) => setEditForm({ ...editForm, fromUser: v })}>
                <SelectTrigger className={editErrors.fromUser ? 'border-destructive' : ''}><SelectValue /></SelectTrigger>
                <SelectContent>{users.map((u) => (<SelectItem key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</SelectItem>))}</SelectContent>
              </Select>
              <FieldError error={editErrors.fromUser} />
            </div>
            <div className="space-y-1">
              <Label>{t('toUser')}</Label>
              <Select value={editForm.toUser} onValueChange={(v) => setEditForm({ ...editForm, toUser: v })}>
                <SelectTrigger className={editErrors.toUser ? 'border-destructive' : ''}><SelectValue /></SelectTrigger>
                <SelectContent>{users.map((u) => (<SelectItem key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</SelectItem>))}</SelectContent>
              </Select>
              <FieldError error={editErrors.toUser} />
            </div>
            <div className="space-y-1">
              <Label>{t('status')}</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v as TransferStatus })}>
                <SelectTrigger className={editErrors.status ? 'border-destructive' : ''}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">{t('pending')}</SelectItem>
                  <SelectItem value="RECEIVED">{t('received')}</SelectItem>
                  <SelectItem value="COMPLETED">{t('completed')}</SelectItem>
                </SelectContent>
              </Select>
              <FieldError error={editErrors.status} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleEditSave} className="flex-1">{t('save')}</Button>
              <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1">{t('cancel')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmDeleteTransfer')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('search')} value={search} onChange={(e) => handleSearch(e.target.value)} className="ps-9" />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder={t('filterByStatus')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatuses')}</SelectItem>
            <SelectItem value="pending">{t('pending')}</SelectItem>
            <SelectItem value="received">{t('received')}</SelectItem>
            <SelectItem value="completed">{t('completed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('transferId')}</TableHead>
                <TableHead>{t('fromUser')}</TableHead>
                <TableHead>{t('toUser')}</TableHead>
                <TableHead>{t('file')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t('noData')}</TableCell></TableRow>
              ) : paginated.map((tr) => (
                <TableRow key={tr.id}>
                  <TableCell className="font-medium">#{tr.id}</TableCell>
                  <TableCell>{tr.fromUser}</TableCell>
                  <TableCell>{tr.toUser}</TableCell>
                  <TableCell>{tr.fileId}</TableCell>
                  <TableCell>{statusBadge(tr.status)}</TableCell>
                  <TableCell>{tr.date}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(tr)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteClick(tr)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-sm text-muted-foreground">
          {t('showing')} {filtered.length > 0 ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} {t('of')} {filtered.length}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('itemsPerPage')}</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-16 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i + 1} variant={page === i + 1 ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setPage(i + 1)}>{i + 1}</Button>
            ))}
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransfersPage;
