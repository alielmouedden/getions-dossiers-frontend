import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronLeft, ChevronRight, Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTransfers } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Transfer } from '@/types';
import { useLocation } from 'react-router-dom';

const MyTransfersPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { transfers, isLoading, updateTransfer } = useTransfers('me');
  const { user } = useAuth();
  const userName = `${user?.firstName} ${user?.lastName}`;
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tab, setTab] = useState('sent');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    if (location.state && (location.state as any).tab) {
      setTab((location.state as any).tab);
    }
  }, [location.state]);

  const myTransfers = useMemo(() => {
    const base = tab === 'sent'
      ? transfers.filter(tr => tr.fromUser === userName || tr.fromUserUsername === user?.username) // Flexible check
      : transfers.filter(tr => tr.toUser === userName || tr.toUserUsername === user?.username);

    let result = base;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(tr => {
        const fromUser = tr.fromUser || '';
        const toUser = tr.toUser || '';
        const fileId = tr.fileId || '';
        
        let folderIdentifier = fileId;
        if (tr.folder) {
          const fn = tr.folder.folderNumber || '';
          const fs = tr.folder.folderSymbol || '';
          const year = tr.folder.createdAt ? tr.folder.createdAt.substring(0, 4) : '';
          folderIdentifier = `${fn}/${fs}/${year}`;
        }
        
        return (
          fromUser.toLowerCase().includes(q) ||
          toUser.toLowerCase().includes(q) ||
          fileId.toLowerCase().includes(q) ||
          folderIdentifier.toLowerCase().includes(q)
        );
      });
    }
    if (statusFilter !== 'all') {
      result = result.filter(tr => tr.status === statusFilter);
    }
    return result;
  }, [tab, search, statusFilter, transfers, userName]);

  const totalPages = Math.max(1, Math.ceil(myTransfers.length / pageSize));
  const paginated = myTransfers.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleStatusFilter = (val: string) => { setStatusFilter(val); setPage(1); };
  const handleTabChange = (val: string) => { setTab(val); setPage(1); setSearch(''); setStatusFilter('all'); };

  const handleStatusUpdate = (tr: Transfer, newStatus: string) => {
    updateTransfer({ 
      id: tr.id, 
      transfer: { ...tr, status: newStatus.toUpperCase() } 
    }, {
      onSuccess: () => toast({ title: t('transferUpdated') }),
      onError: (error: any) => {
        const errorMsg = error.message || '';
        const displayMsg = errorMsg.startsWith('RequestTransfer not found')
          ? t('requestTransferNotFound')
          : t(errorMsg);
        toast({
          title: t('error'),
          description: displayMsg,
          variant: 'destructive'
        });
      }
    });
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-success/10 text-success border-success/20',
      pending: 'bg-warning/10 text-warning border-warning/20',
      received: 'bg-info/10 text-info border-info/20',
    };
    const s = status.toLowerCase();
    return <Badge variant="outline" className={styles[s] || styles.pending}>{t(s)}</Badge>;
  };

  const exportHeaders = [
    { key: 'id', label: t('transferId') },
    { key: 'fromUser', label: t('fromUser') },
    { key: 'toUser', label: t('toUser') },
    { key: 'fileId', label: t('file') },
    { key: 'statusTrans', label: t('status') },
    { key: 'date', label: t('date') },
  ];

  const getTranslatedTransfers = () => myTransfers.map(tr => ({
    ...tr,
    statusTrans: t(tr.status.toLowerCase()),
    fileId: tr.folder ? `${tr.folder.folderNumber}/${tr.folder.folderSymbol}/${tr.folder.createdAt ? tr.folder.createdAt.substring(0, 4) : ''}` : tr.fileId
  }));

  if (isLoading) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4 animate-fade-in text-start rtl:text-end">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{t('myTransfersLog')}</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> {t('export')}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => exportToCSV(getTranslatedTransfers() as unknown as Record<string, string>[], exportHeaders, 'my-transfers')}>
              <FileSpreadsheet className="w-4 h-4 me-2" /> {t('exportCSV')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={async () => await exportToPDF(getTranslatedTransfers() as unknown as Record<string, string>[], exportHeaders, 'my-transfers', t('myTransfersLog'))}>
              <FileText className="w-4 h-4 me-2" /> {t('exportPDF')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-2 max-w-xs">
          <TabsTrigger value="sent">{t('sentTransfers')}</TabsTrigger>
          <TabsTrigger value="received">{t('receivedTransfers')}</TabsTrigger>
        </TabsList>
      </Tabs>

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
                <TableHead>{tab === 'sent' ? t('toUser') : t('fromUser')}</TableHead>
                <TableHead>{t('file')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('date')}</TableHead>
                {tab === 'received' && <TableHead className="text-end">{t('actions')}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={tab === 'received' ? 6 : 5} className="text-center py-8 text-muted-foreground">{t('noData')}</TableCell></TableRow>
              ) : paginated.map((tr) => (
                <TableRow key={tr.id}>
                  <TableCell className="font-medium">#{tr.id}</TableCell>
                  <TableCell>{tab === 'sent' ? tr.toUser : tr.fromUser}</TableCell>
                  <TableCell>{tr.folder ? `${tr.folder.folderNumber}/${tr.folder.folderSymbol}/${tr.folder.createdAt ? tr.folder.createdAt.substring(0, 4) : ''}` : tr.fileId}</TableCell>
                  <TableCell>{statusBadge(tr.status)}</TableCell>
                  <TableCell>{tr.date}</TableCell>
                  {tab === 'received' && (
                    <TableCell className="text-end">
                      {tr.status.toLowerCase() === 'pending' && (
                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(tr, 'received')}>
                          {t('confirmReceipt')}
                        </Button>
                      )}
                      {tr.status.toLowerCase() === 'received' && (
                        <Button variant="outline" size="sm" className="text-success border-success/20 hover:bg-success/10 hover:text-success" onClick={() => handleStatusUpdate(tr, 'completed')}>
                          {t('complete')}
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-sm text-muted-foreground">
          {t('showing')} {myTransfers.length > 0 ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, myTransfers.length)} {t('of')} {myTransfers.length}
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

export default MyTransfersPage;
