import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronLeft, ChevronRight, Download, FileSpreadsheet, FileText, LogIn, LogOut, FilePlus, FileEdit, Trash2, Send, UserPlus, UserCog } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SystemLog {
  id: string;
  user: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
  type: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'transfer';
}

const mockLogs: SystemLog[] = [
  { id: '1', user: 'أحمد محمدي', action: 'login', target: '-', details: 'تسجيل دخول ناجح', timestamp: '2024-05-10 08:30:00', type: 'login' },
  { id: '2', user: 'أحمد محمدي', action: 'createFile', target: 'F-2024-005', details: 'إنشاء ملف جديد', timestamp: '2024-05-10 09:15:00', type: 'create' },
  { id: '3', user: 'فاطمة بنعلي', action: 'login', target: '-', details: 'تسجيل دخول ناجح', timestamp: '2024-05-10 09:30:00', type: 'login' },
  { id: '4', user: 'أحمد محمدي', action: 'transferFile', target: 'F-2024-001', details: 'إحالة ملف إلى فاطمة بنعلي', timestamp: '2024-05-10 10:00:00', type: 'transfer' },
  { id: '5', user: 'فاطمة بنعلي', action: 'updateFile', target: 'F-2024-002', details: 'تعديل بيانات الملف', timestamp: '2024-05-10 10:30:00', type: 'update' },
  { id: '6', user: 'يوسف الكريمي', action: 'login', target: '-', details: 'تسجيل دخول ناجح', timestamp: '2024-05-10 11:00:00', type: 'login' },
  { id: '7', user: 'يوسف الكريمي', action: 'deleteFile', target: 'F-2024-003', details: 'حذف ملف', timestamp: '2024-05-10 11:15:00', type: 'delete' },
  { id: '8', user: 'أحمد محمدي', action: 'createUser', target: 'عمر الحسني', details: 'إنشاء حساب مستخدم جديد', timestamp: '2024-05-10 11:30:00', type: 'create' },
  { id: '9', user: 'عمر الحسني', action: 'login', target: '-', details: 'تسجيل دخول ناجح', timestamp: '2024-05-10 12:00:00', type: 'login' },
  { id: '10', user: 'أحمد محمدي', action: 'updateUser', target: 'فاطمة بنعلي', details: 'تعديل صلاحيات المستخدم', timestamp: '2024-05-10 13:00:00', type: 'update' },
  { id: '11', user: 'فاطمة بنعلي', action: 'logout', target: '-', details: 'تسجيل خروج', timestamp: '2024-05-10 14:00:00', type: 'logout' },
  { id: '12', user: 'أحمد محمدي', action: 'transferFile', target: 'F-2024-004', details: 'إحالة ملف إلى يوسف الكريمي', timestamp: '2024-05-10 14:30:00', type: 'transfer' },
  { id: '13', user: 'يوسف الكريمي', action: 'logout', target: '-', details: 'تسجيل خروج', timestamp: '2024-05-10 15:00:00', type: 'logout' },
  { id: '14', user: 'أحمد محمدي', action: 'deleteUser', target: 'أمينة السعدي', details: 'حذف حساب مستخدم', timestamp: '2024-05-10 15:30:00', type: 'delete' },
  { id: '15', user: 'أحمد محمدي', action: 'logout', target: '-', details: 'تسجيل خروج', timestamp: '2024-05-10 16:00:00', type: 'logout' },
];

import { useLogs } from '@/hooks/use-api';

const SystemLogsPage = () => {
  const { t } = useTranslation();
  const { logs, isLoading } = useLogs();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filtered = useMemo(() => {
    let result = (logs as any[]) || [];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(log =>
        (log.user || '').toLowerCase().includes(q) ||
        (log.target || '').toLowerCase().includes(q) ||
        (log.details || '').toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') {
      result = result.filter(log => log.type === typeFilter);
    }
    return result;
  }, [logs, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleTypeFilter = (val: string) => { setTypeFilter(val); setPage(1); };

  const actionIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      login: <LogIn className="w-4 h-4" />,
      logout: <LogOut className="w-4 h-4" />,
      create: <FilePlus className="w-4 h-4" />,
      update: <FileEdit className="w-4 h-4" />,
      delete: <Trash2 className="w-4 h-4" />,
      transfer: <Send className="w-4 h-4" />,
    };
    return icons[type] || null;
  };

  const typeBadge = (type: string) => {
    const styles: Record<string, string> = {
      login: 'bg-success/10 text-success border-success/20',
      logout: 'bg-muted text-muted-foreground border-border',
      create: 'bg-info/10 text-info border-info/20',
      update: 'bg-warning/10 text-warning border-warning/20',
      delete: 'bg-destructive/10 text-destructive border-destructive/20',
      transfer: 'bg-primary/10 text-primary border-primary/20',
    };
    return (
      <Badge variant="outline" className={`gap-1.5 ${styles[type] || ''}`}>
        {actionIcon(type)}
        {t(`logType_${type}`)}
      </Badge>
    );
  };

  const exportHeaders = [
    { key: 'id', label: '#' },
    { key: 'user', label: t('logUser') },
    { key: 'actionTrans', label: t('logAction') },
    { key: 'target', label: t('logTarget') },
    { key: 'details', label: t('logDetails') },
    { key: 'timestamp', label: t('logTimestamp') },
  ];

  const getTranslatedLogs = () => filtered.map(log => ({
    ...log,
    actionTrans: t(`logType_${log.type}`)
  }));

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      if (start > 2) {
        pages.push('ellipsis-start');
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{t('systemLogs')}</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> {t('export')}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => exportToCSV(getTranslatedLogs() as unknown as Record<string, string>[], exportHeaders, 'system-logs')}>
              <FileSpreadsheet className="w-4 h-4 me-2" /> {t('exportCSV')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={async () => await exportToPDF(getTranslatedLogs() as unknown as Record<string, string>[], exportHeaders, 'system-logs', t('systemLogs'))}>
              <FileText className="w-4 h-4 me-2" /> {t('exportPDF')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('search')} value={search} onChange={(e) => handleSearch(e.target.value)} className="ps-9" />
        </div>
        <Select value={typeFilter} onValueChange={handleTypeFilter}>
          <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder={t('filterByType')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTypes')}</SelectItem>
            <SelectItem value="login">{t('logType_login')}</SelectItem>
            <SelectItem value="logout">{t('logType_logout')}</SelectItem>
            <SelectItem value="create">{t('logType_create')}</SelectItem>
            <SelectItem value="update">{t('logType_update')}</SelectItem>
            <SelectItem value="delete">{t('logType_delete')}</SelectItem>
            <SelectItem value="transfer">{t('logType_transfer')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{t('logUser')}</TableHead>
                <TableHead>{t('logAction')}</TableHead>
                <TableHead>{t('logTarget')}</TableHead>
                <TableHead>{t('logDetails')}</TableHead>
                <TableHead>{t('logTimestamp')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('noData')}</TableCell></TableRow>
              ) : paginated.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.id}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>{typeBadge(log.type)}</TableCell>
                  <TableCell>{log.target}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{log.details}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{log.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
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
              {getPageNumbers().map((p, idx) => {
                if (p === 'ellipsis-start' || p === 'ellipsis-end') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground select-none">
                      ...
                    </span>
                  );
                }
                const pageNum = p as number;
                return (
                  <Button key={pageNum} variant={page === pageNum ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setPage(pageNum)}>{pageNum}</Button>
                );
              })}
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SystemLogsPage;
