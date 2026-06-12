import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { fileSchema, validateForm } from '@/lib/validation';
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
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFiles, useUsers, useTransfers } from '@/hooks/use-api';
import { useAuth } from '@/contexts/AuthContext';
import { CaseFile } from '@/types';

const FilesPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const userName = user ? `${user.firstName} ${user.lastName}` : '';
  const isAdmin = user?.role === 'MANAGER' || (user?.roles && (user.roles.includes('ROLE_MANAGER') || user.roles.includes('MANAGER')));
  const isSessionClerk = user?.role === 'SESSION_CLERK' || (user?.roles && (user.roles.includes('ROLE_SESSION_CLERK') || user.roles.includes('SESSION_CLERK')));

  const { files: allFiles, isLoading, addFile, updateFile, deleteFile } = useFiles(isAdmin ? 'all' : 'me');
  const { transfers } = useTransfers();
  const { users } = useUsers();

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<CaseFile | null>(null);
  const [year, setYear] = useState('');
  const [editYear, setEditYear] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [form, setForm] = useState({ folderNumber: '', folderSymbol: '', createdBy: '', statuts: 'CREATION' });
  const [editForm, setEditForm] = useState({ folderNumber: '', folderSymbol: '', createdBy: '', statuts: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Sync search from URL
  useEffect(() => {
    const s = searchParams.get('search');
    if (s) {
      setSearch(s);
      setPage(1);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    let base = allFiles;
    // Backend 'available' endpoint already filters for non-admins correctly
    if (isAdmin) {
      // Admins might want to switch back to 'all' mode if needed, 
      // but for now we follow the 'available' logic.
    }

    if (!search) return base;
    const q = search.toLowerCase();
    return base.filter(f =>
      f.folderNumber.toLowerCase().includes(q) ||
      f.folderSymbol.toLowerCase().includes(q) ||
      f.createdBy.toLowerCase().includes(q)
    );
  }, [allFiles, search, isAdmin, isSessionClerk, transfers, userName]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };

  const handleAdd = () => {
    const { success, errors: validationErrors } = validateForm(fileSchema, form, t);

    const currentYear = new Date().getFullYear();
    const yearNum = Number(year);
    const customErrors: Record<string, string> = { ...validationErrors };
    if (year && (isNaN(yearNum) || yearNum < 1950 || yearNum > currentYear)) {
      customErrors.creationYear = t('invalidYearRange');
    }

    if (!success || Object.keys(customErrors).length > 0) { setErrors(customErrors); return; }

    // Find the user object for createdBy
    const creatorUser = users.find(u => `${u.firstName} ${u.lastName}` === form.createdBy);

    const folderData = {
      folderNumber: form.folderNumber,
      folderSymbol: form.folderSymbol,
      statuts: form.statuts,
      createdAt: year ? `${year}-01-01` : new Date().toISOString().split('T')[0],
      createdBy: creatorUser ? { userId: Number(creatorUser.id) } : null
    };

    addFile(folderData, {
      onSuccess: () => {
        setOpen(false);
        setForm({ folderNumber: '', folderSymbol: '', createdBy: '', statuts: 'CREATION' });
        setYear('');
        setErrors({});
        toast({ title: t('fileAdded') });
      },
      onError: () => toast({ title: t('error'), variant: 'destructive' })
    });
  };

  const handleEdit = (file: CaseFile) => {
    setSelectedFile(file);
    setEditForm({
      folderNumber: file.folderNumber,
      folderSymbol: file.folderSymbol,
      createdBy: file.createdBy,
      statuts: file.statuts || 'CREATION'
    });
    setEditYear(file.creationDate ? file.creationDate.substring(0, 4) : '');
    setEditErrors({});
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!selectedFile) return;
    const { success, errors: validationErrors } = validateForm(fileSchema, editForm, t);

    const currentYear = new Date().getFullYear();
    const yearNum = Number(editYear);
    const customErrors: Record<string, string> = { ...validationErrors };
    if (editYear && (isNaN(yearNum) || yearNum < 1950 || yearNum > currentYear)) {
      customErrors.creationYear = t('invalidYearRange');
    }

    if (!success || Object.keys(customErrors).length > 0) { setEditErrors(customErrors); return; }

    // Find the user object for createdBy
    const creatorUser = users.find(u => `${u.firstName} ${u.lastName}` === editForm.createdBy);

    const folderData = {
      folderNumber: editForm.folderNumber,
      folderSymbol: editForm.folderSymbol,
      statuts: editForm.statuts,
      createdAt: editYear ? `${editYear}-01-01` : selectedFile.creationDate,
      createdBy: creatorUser ? { userId: Number(creatorUser.id) } : null
    };

    updateFile({ id: selectedFile.id, folder: folderData }, {
      onSuccess: () => {
        setEditOpen(false);
        setSelectedFile(null);
        setEditErrors({});
        toast({ title: t('fileUpdated') });
      },
      onError: () => toast({ title: t('error'), variant: 'destructive' })
    });
  };

  const handleDeleteClick = (file: CaseFile) => {
    setSelectedFile(file);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedFile) return;
    deleteFile(selectedFile.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setSelectedFile(null);
        toast({ title: t('fileDeleted') });
      },
      onError: () => toast({ title: t('error'), variant: 'destructive' })
    });
  };

  const statusBadge = (s?: string) => {
    if (!s) return null;
    const variants: Record<string, string> = {
      CREATION: 'bg-info/10 text-info border-info/20',
      IN_SESSION: 'bg-warning/10 text-warning border-warning/20',
      IN_DELIBERATION: 'bg-primary/10 text-primary border-primary/20',
      DRAFTED: 'bg-success/10 text-success border-success/20',
      ARCHIVED: 'bg-muted text-muted-foreground border-border',
    };
    return <Badge variant="outline" className={variants[s] || variants.CREATION}>{t(s)}</Badge>;
  };

  const FieldError = ({ error }: { error?: string }) => error ? <p className="text-xs text-destructive mt-1">{error}</p> : null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{t('fileManagement')}</h2>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> {t('export')}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => {
                const headers = [
                  { key: 'folderNumber', label: t('fileNumber') }, { key: 'folderSymbol', label: t('folderSymbol') },
                  { key: 'createdBy', label: t('createdBy') }, { key: 'creationDate', label: t('creationYear') },
                ];
                exportToCSV(filtered as unknown as Record<string, string>[], headers, 'files');
              }}>
                <FileSpreadsheet className="w-4 h-4 me-2" /> {t('exportCSV')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                const headers = [
                  { key: 'folderNumber', label: t('fileNumber') }, { key: 'folderSymbol', label: t('folderSymbol') },
                  { key: 'createdBy', label: t('createdBy') }, { key: 'creationDate', label: t('creationYear') },
                ];
                await exportToPDF(filtered as unknown as Record<string, string>[], headers, 'files', t('fileManagement'));
              }}>
                <FileText className="w-4 h-4 me-2" /> {t('exportPDF')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setErrors({}); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> {t('addFile')}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t('addFile')}</DialogTitle>
                <DialogDescription className="sr-only">{t('addFile')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>{t('fileNumber')}</Label>
                  <Input value={form.folderNumber} onChange={(e) => setForm({ ...form, folderNumber: e.target.value })} className={errors.folderNumber ? 'border-destructive' : ''} />
                  <FieldError error={errors.folderNumber} />
                </div>
                <div className="space-y-1">
                  <Label>{t('folderSymbol')}</Label>
                  <Input value={form.folderSymbol} onChange={(e) => setForm({ ...form, folderSymbol: e.target.value })} className={errors.folderSymbol ? 'border-destructive' : ''} />
                  <FieldError error={errors.folderSymbol} />
                </div>
                <div className="space-y-1">
                  <Label>{t('createdBy')}</Label>
                  <Select value={form.createdBy} onValueChange={(v) => setForm({ ...form, createdBy: v })}>
                    <SelectTrigger className={errors.createdBy ? 'border-destructive' : ''}><SelectValue placeholder={t('selectUser')} /></SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError error={errors.createdBy} />
                </div>
                <div className="space-y-1">
                  <Label>{t('creationYear')}</Label>
                  <Input
                    type="number"
                    min="1950"
                    max={new Date().getFullYear()}
                    placeholder={t('creationYear')}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className={errors.creationYear ? 'border-destructive' : ''}
                  />
                  <FieldError error={errors.creationYear} />
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
            <DialogTitle>{t('editFile')}</DialogTitle>
            <DialogDescription className="sr-only">{t('editFile')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>{t('fileNumber')}</Label>
              <Input value={editForm.folderNumber} onChange={(e) => setEditForm({ ...editForm, folderNumber: e.target.value })} className={editErrors.folderNumber ? 'border-destructive' : ''} />
              <FieldError error={editErrors.folderNumber} />
            </div>
            <div className="space-y-1">
              <Label>{t('folderSymbol')}</Label>
              <Input value={editForm.folderSymbol} onChange={(e) => setEditForm({ ...editForm, folderSymbol: e.target.value })} className={editErrors.folderSymbol ? 'border-destructive' : ''} />
              <FieldError error={editErrors.folderSymbol} />
            </div>
            <div className="space-y-1">
              <Label>{t('createdBy')}</Label>
              <Select value={editForm.createdBy} onValueChange={(v) => setEditForm({ ...editForm, createdBy: v })}>
                <SelectTrigger className={editErrors.createdBy ? 'border-destructive' : ''}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError error={editErrors.createdBy} />
            </div>
            <div className="space-y-1">
              <Label>{t('status')}</Label>
              <Select value={editForm.statuts} onValueChange={(v) => setEditForm({ ...editForm, statuts: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CREATION">{t('CREATION')}</SelectItem>
                  <SelectItem value="IN_SESSION">{t('IN_SESSION')}</SelectItem>
                  <SelectItem value="IN_DELIBERATION">{t('IN_DELIBERATION')}</SelectItem>
                  <SelectItem value="DRAFTED">{t('DRAFTED')}</SelectItem>
                  <SelectItem value="ARCHIVED">{t('ARCHIVED')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{t('creationYear')}</Label>
              <Input
                type="number"
                min="1950"
                max={new Date().getFullYear()}
                placeholder={t('creationYear')}
                value={editYear}
                onChange={(e) => setEditYear(e.target.value)}
                className={editErrors.creationYear ? 'border-destructive' : ''}
              />
              <FieldError error={editErrors.creationYear} />
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
            <AlertDialogDescription>{t('confirmDeleteFile')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={t('search')} value={search} onChange={(e) => handleSearch(e.target.value)} className="ps-9" />
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0 overflow-x-auto relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('fileNumber')}</TableHead>
                <TableHead>{t('folderSymbol')}</TableHead>
                <TableHead>{t('createdBy')}</TableHead>
                <TableHead>{t('creationYear')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t('noData')}</TableCell></TableRow>
              ) : paginated.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">{file.folderNumber}</TableCell>
                  <TableCell>{file.folderSymbol}</TableCell>
                  <TableCell>{file.createdBy}</TableCell>
                  <TableCell>{file.creationDate}</TableCell>
                  <TableCell>{statusBadge(file.statuts)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(file)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteClick(file)}><Trash2 className="w-4 h-4" /></Button>
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

export default FilesPage;
