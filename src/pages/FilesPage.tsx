import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { fileSchema, validateForm } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
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
import { mockFiles, mockUsers } from '@/data/mock';
import { CaseFile } from '@/types';

const PAGE_SIZE = 5;

const FilesPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [files, setFiles] = useState<CaseFile[]>(mockFiles);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<CaseFile | null>(null);
  const [year, setYear] = useState('');
  const [editYear, setEditYear] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ fileNumber: '', folderNumber: '', createdBy: '' });
  const [editForm, setEditForm] = useState({ fileNumber: '', folderNumber: '', createdBy: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    if (!search) return files;
    const q = search.toLowerCase();
    return files.filter(f =>
      f.fileNumber.toLowerCase().includes(q) ||
      f.folderNumber.toLowerCase().includes(q) ||
      f.createdBy.toLowerCase().includes(q)
    );
  }, [files, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };

  const handleAdd = () => {
    const { success, errors: validationErrors } = validateForm(fileSchema, form, t);
    if (!success) { setErrors(validationErrors); return; }
    const newFile: CaseFile = { id: String(files.length + 1), ...form, creationDate: year };
    setFiles([...files, newFile]);
    setOpen(false);
    setForm({ fileNumber: '', folderNumber: '', createdBy: '' });
    setYear('');
    setErrors({});
    toast({ title: t('fileAdded') });
  };

  const handleEdit = (file: CaseFile) => {
    setSelectedFile(file);
    setEditForm({ fileNumber: file.fileNumber, folderNumber: file.folderNumber, createdBy: file.createdBy });
    setEditYear(file.creationDate ? file.creationDate.substring(0, 4) : '');
    setEditErrors({});
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!selectedFile) return;
    const { success, errors: validationErrors } = validateForm(fileSchema, editForm, t);
    if (!success) { setEditErrors(validationErrors); return; }
    setFiles(files.map(f => f.id === selectedFile.id ? { ...f, ...editForm, creationDate: editYear || f.creationDate } : f));
    setEditOpen(false);
    setSelectedFile(null);
    setEditErrors({});
    toast({ title: t('fileUpdated') });
  };

  const handleDeleteClick = (file: CaseFile) => {
    setSelectedFile(file);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedFile) return;
    setFiles(files.filter(f => f.id !== selectedFile.id));
    setDeleteOpen(false);
    setSelectedFile(null);
    toast({ title: t('fileDeleted') });
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
                  { key: 'fileNumber', label: t('fileNumber') }, { key: 'folderNumber', label: t('folderNumber') },
                  { key: 'createdBy', label: t('createdBy') }, { key: 'creationDate', label: t('creationYear') },
                ];
                exportToCSV(filtered as unknown as Record<string, string>[], headers, 'files');
              }}>
                <FileSpreadsheet className="w-4 h-4 me-2" /> {t('exportCSV')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const headers = [
                  { key: 'fileNumber', label: t('fileNumber') }, { key: 'folderNumber', label: t('folderNumber') },
                  { key: 'createdBy', label: t('createdBy') }, { key: 'creationDate', label: t('creationYear') },
                ];
                exportToPDF(filtered as unknown as Record<string, string>[], headers, 'files', t('fileManagement'));
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
              <DialogHeader><DialogTitle>{t('addFile')}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>{t('fileNumber')}</Label>
                  <Input value={form.fileNumber} onChange={(e) => setForm({ ...form, fileNumber: e.target.value })} className={errors.fileNumber ? 'border-destructive' : ''} />
                  <FieldError error={errors.fileNumber} />
                </div>
                <div className="space-y-1">
                  <Label>{t('folderNumber')}</Label>
                  <Input value={form.folderNumber} onChange={(e) => setForm({ ...form, folderNumber: e.target.value })} className={errors.folderNumber ? 'border-destructive' : ''} />
                  <FieldError error={errors.folderNumber} />
                </div>
                <div className="space-y-1">
                  <Label>{t('createdBy')}</Label>
                  <Select value={form.createdBy} onValueChange={(v) => setForm({ ...form, createdBy: v })}>
                    <SelectTrigger className={errors.createdBy ? 'border-destructive' : ''}><SelectValue placeholder={t('selectUser')} /></SelectTrigger>
                    <SelectContent>
                      {mockUsers.map((u) => (
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
                    min="1900"
                    max="2099"
                    placeholder={t('creationYear')}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
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
          <DialogHeader><DialogTitle>{t('editFile')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>{t('fileNumber')}</Label>
              <Input value={editForm.fileNumber} onChange={(e) => setEditForm({ ...editForm, fileNumber: e.target.value })} className={editErrors.fileNumber ? 'border-destructive' : ''} />
              <FieldError error={editErrors.fileNumber} />
            </div>
            <div className="space-y-1">
              <Label>{t('folderNumber')}</Label>
              <Input value={editForm.folderNumber} onChange={(e) => setEditForm({ ...editForm, folderNumber: e.target.value })} className={editErrors.folderNumber ? 'border-destructive' : ''} />
              <FieldError error={editErrors.folderNumber} />
            </div>
            <div className="space-y-1">
              <Label>{t('createdBy')}</Label>
              <Select value={editForm.createdBy} onValueChange={(v) => setEditForm({ ...editForm, createdBy: v })}>
                <SelectTrigger className={editErrors.createdBy ? 'border-destructive' : ''}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {mockUsers.map((u) => (
                    <SelectItem key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError error={editErrors.createdBy} />
            </div>
            <div className="space-y-1">
              <Label>{t('creationYear')}</Label>
              <Input
                type="number"
                min="1900"
                max="2099"
                placeholder={t('creationYear')}
                value={editYear}
                onChange={(e) => setEditYear(e.target.value)}
              />
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
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('fileNumber')}</TableHead>
                <TableHead>{t('folderNumber')}</TableHead>
                <TableHead>{t('createdBy')}</TableHead>
                <TableHead>{t('creationYear')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t('noData')}</TableCell></TableRow>
              ) : paginated.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">{file.fileNumber}</TableCell>
                  <TableCell>{file.folderNumber}</TableCell>
                  <TableCell>{file.createdBy}</TableCell>
                  <TableCell>{file.creationDate}</TableCell>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t('showing')} {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} {t('of')} {filtered.length}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i + 1} variant={page === i + 1 ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setPage(i + 1)}>{i + 1}</Button>
            ))}
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesPage;
