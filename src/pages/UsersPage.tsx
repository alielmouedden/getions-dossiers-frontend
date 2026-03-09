import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { userAddSchema, userEditSchema, validateForm } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/use-toast';
import { mockUsers } from '@/data/mock';
import { User, UserRole } from '@/types';

const PAGE_SIZE = 4;

const UsersPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', username: '', password: '', role: 'employee' as UserRole, phone: '' });
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', username: '', role: 'employee' as UserRole, phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    let result = users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }
    return result;
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAdd = () => {
    const { success, errors: validationErrors } = validateForm(userAddSchema, form, t);
    if (!success) { setErrors(validationErrors); return; }
    const newUser: User = { id: String(users.length + 1), ...form, active: true };
    setUsers([...users, newUser]);
    setOpen(false);
    setForm({ firstName: '', lastName: '', email: '', username: '', password: '', role: 'employee', phone: '' });
    setErrors({});
    toast({ title: t('userAdded') });
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, username: user.username, role: user.role, phone: user.phone });
    setEditErrors({});
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!selectedUser) return;
    const { success, errors: validationErrors } = validateForm(userEditSchema, editForm, t);
    if (!success) { setEditErrors(validationErrors); return; }
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...editForm } : u));
    setEditOpen(false);
    setSelectedUser(null);
    setEditErrors({});
    toast({ title: t('userUpdated') });
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedUser) return;
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setDeleteOpen(false);
    setSelectedUser(null);
    toast({ title: t('userDeleted') });
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-destructive/10 text-destructive border-destructive/20',
      employee: 'bg-info/10 text-info border-info/20',
      consultant: 'bg-success/10 text-success border-success/20',
    };
    return <Badge variant="outline" className={styles[role]}>{t(role)}</Badge>;
  };

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleRoleFilter = (val: string) => { setRoleFilter(val); setPage(1); };

  const FieldError = ({ error }: { error?: string }) => error ? <p className="text-xs text-destructive mt-1">{error}</p> : null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{t('userManagement')}</h2>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> {t('export')}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => {
                const headers = [
                  { key: 'id', label: t('id') }, { key: 'username', label: t('username') },
                  { key: 'firstName', label: t('firstName') }, { key: 'lastName', label: t('lastName') },
                  { key: 'email', label: t('email') }, { key: 'role', label: t('role') }, { key: 'phone', label: t('phone') },
                ];
                exportToCSV(filtered as unknown as Record<string, string>[], headers, 'users');
              }}>
                <FileSpreadsheet className="w-4 h-4 me-2" /> {t('exportCSV')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const headers = [
                  { key: 'id', label: t('id') }, { key: 'username', label: t('username') },
                  { key: 'firstName', label: t('firstName') }, { key: 'lastName', label: t('lastName') },
                  { key: 'email', label: t('email') }, { key: 'role', label: t('role') }, { key: 'phone', label: t('phone') },
                ];
                exportToPDF(filtered as unknown as Record<string, string>[], headers, 'users', t('userManagement'));
              }}>
                <FileText className="w-4 h-4 me-2" /> {t('exportPDF')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setErrors({}); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> {t('addUser')}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{t('addUser')}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>{t('firstName')}</Label>
                    <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={errors.firstName ? 'border-destructive' : ''} />
                    <FieldError error={errors.firstName} />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('lastName')}</Label>
                    <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={errors.lastName ? 'border-destructive' : ''} />
                    <FieldError error={errors.lastName} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>{t('email')}</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={errors.email ? 'border-destructive' : ''} />
                  <FieldError error={errors.email} />
                </div>
                <div className="space-y-1">
                  <Label>{t('username')}</Label>
                  <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className={errors.username ? 'border-destructive' : ''} />
                  <FieldError error={errors.username} />
                </div>
                <div className="space-y-1">
                  <Label>{t('password')}</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={errors.password ? 'border-destructive' : ''} />
                  <FieldError error={errors.password} />
                </div>
                <div className="space-y-1">
                  <Label>{t('role')}</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                    <SelectTrigger><SelectValue placeholder={t('selectRole')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{t('admin')}</SelectItem>
                      <SelectItem value="employee">{t('employee')}</SelectItem>
                      <SelectItem value="consultant">{t('consultant')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>{t('phone')}</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={errors.phone ? 'border-destructive' : ''} />
                  <FieldError error={errors.phone} />
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
          <DialogHeader><DialogTitle>{t('editUser')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{t('firstName')}</Label>
                <Input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className={editErrors.firstName ? 'border-destructive' : ''} />
                <FieldError error={editErrors.firstName} />
              </div>
              <div className="space-y-1">
                <Label>{t('lastName')}</Label>
                <Input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className={editErrors.lastName ? 'border-destructive' : ''} />
                <FieldError error={editErrors.lastName} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>{t('email')}</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={editErrors.email ? 'border-destructive' : ''} />
              <FieldError error={editErrors.email} />
            </div>
            <div className="space-y-1">
              <Label>{t('username')}</Label>
              <Input value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className={editErrors.username ? 'border-destructive' : ''} />
              <FieldError error={editErrors.username} />
            </div>
            <div className="space-y-1">
              <Label>{t('role')}</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v as UserRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('admin')}</SelectItem>
                  <SelectItem value="employee">{t('employee')}</SelectItem>
                  <SelectItem value="consultant">{t('consultant')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{t('phone')}</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className={editErrors.phone ? 'border-destructive' : ''} />
              <FieldError error={editErrors.phone} />
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
            <AlertDialogDescription>{t('confirmDeleteUser')}</AlertDialogDescription>
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
        <Select value={roleFilter} onValueChange={handleRoleFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder={t('filterByRole')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allRoles')}</SelectItem>
            <SelectItem value="admin">{t('admin')}</SelectItem>
            <SelectItem value="employee">{t('employee')}</SelectItem>
            <SelectItem value="consultant">{t('consultant')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('id')}</TableHead>
                <TableHead>{t('username')}</TableHead>
                <TableHead>{t('firstName')}</TableHead>
                <TableHead>{t('lastName')}</TableHead>
                <TableHead>{t('email')}</TableHead>
                <TableHead>{t('role')}</TableHead>
                <TableHead>{t('phone')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{t('noData')}</TableCell></TableRow>
              ) : paginated.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{roleBadge(user.role)}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(user)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteClick(user)}><Trash2 className="w-4 h-4" /></Button>
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

export default UsersPage;
