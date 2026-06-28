import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronLeft, ChevronRight, Download, FileSpreadsheet, FileText, Loader2, Check, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRequestTransfers } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Label } from '@/components/ui/label';

const MyTransfersPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const location = useLocation();
  
  const { user } = useAuth();
  const isSessionClerk = user?.role === 'SESSION_CLERK' || (user?.roles && (user.roles.includes('ROLE_SESSION_CLERK') || user.roles.includes('SESSION_CLERK')));
  
  const [tab, setTab] = useState<'sent' | 'received'>('sent');
  const { requests, isLoading, confirm } = useRequestTransfers(tab);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  // Decision Modal State
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();
  const updateFolderMutation = useMutation({
    mutationFn: ({ id, folder }: { id: string; folder: any }) => apiClient.updateFolder(id, folder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['request-transfers'] });
    }
  });

  useEffect(() => {
    if (location.state && (location.state as any).tab) {
      setTab((location.state as any).tab);
    }
  }, [location.state]);

  const myRequests = useMemo(() => {
    let result = requests;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(req => {
        const fromUser = req.createdBy ? `${req.createdBy.firstName} ${req.createdBy.lastName}`.toLowerCase() : '';
        const toUser = req.handledBy ? `${req.handledBy.firstName} ${req.handledBy.lastName}`.toLowerCase() : '';
        const purpose = req.purpose ? req.purpose.toLowerCase() : '';
        
        let folderIdentifier = '';
        if (req.folder) {
          const folderNumber = req.folder.folderNumber || '';
          const folderSymbol = req.folder.folderSymbol || '';
          const year = req.folder.folderYear ? String(req.folder.folderYear) : '';
          folderIdentifier = `${folderNumber}/${folderSymbol}/${year}`.toLowerCase();
        }
        
        return (
          fromUser.includes(q) ||
          toUser.includes(q) ||
          purpose.includes(q) ||
          folderIdentifier.includes(q)
        );
      });
    }
    if (statusFilter !== 'all') {
      result = result.filter(req => req.status?.toLowerCase() === statusFilter.toLowerCase());
    }
    return [...result].sort((a, b) => Number(b.requestTransferId) - Number(a.requestTransferId));
  }, [search, statusFilter, requests]);

  const totalPages = Math.max(1, Math.ceil(myRequests.length / pageSize));
  const paginated = myRequests.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleStatusFilter = (val: string) => { setStatusFilter(val); setPage(1); };
  const handleTabChange = (val: string) => { setTab(val as 'sent' | 'received'); setPage(1); setSearch(''); setStatusFilter('all'); };

  const getErrorMessage = (error: any): string => {
    const errorMsg = error?.message || '';
    if (errorMsg.startsWith('RequestTransfer not found')) {
      return t('requestTransferNotFound');
    }
    const translated = t(errorMsg);
    return translated === errorMsg ? t('unexpectedError') : translated;
  };

  const handleDecision = (status: 'ACCEPTED' | 'REJECTED') => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    
    confirm({ id: selectedRequest.requestTransferId, status }, {
      onSuccess: () => {
        toast({ title: t('decisionSuccess') });
        setDecisionModalOpen(false);
        setSelectedRequest(null);
        setIsSubmitting(false);
      },
      onError: (error: any) => {
        toast({
          title: t('error'),
          description: getErrorMessage(error),
          variant: 'destructive'
        });
        setIsSubmitting(false);
      }
    });
  };

  const handleFolderStatusChange = (folderId: number, newStatus: string) => {
    updateFolderMutation.mutate({
      id: String(folderId),
      folder: { statuts: newStatus }
    }, {
      onSuccess: () => {
        toast({ title: t('fileUpdated') });
      },
      onError: (error: any) => {
        toast({
          title: t('error'),
          description: getErrorMessage(error),
          variant: 'destructive'
        });
      }
    });
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      accepted: 'bg-success/10 text-success border-success/20',
      pending: 'bg-warning/10 text-warning border-warning/20',
      rejected: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    const s = (status || 'PENDING').toLowerCase();
    return <Badge variant="outline" className={styles[s] || styles.pending}>{t(status || 'PENDING')}</Badge>;
  };

  const exportHeaders = [
    { key: 'id', label: t('transferId') },
    { key: 'fromUser', label: t('fromUser') },
    { key: 'toUser', label: t('toUser') },
    { key: 'fileId', label: t('file') },
    { key: 'statusTrans', label: t('status') },
    { key: 'date', label: t('date') },
  ];

  const getTranslatedRequests = () => myRequests.map(req => {
    const folderNumber = req.folder?.folderNumber || '';
    const folderSymbol = req.folder?.folderSymbol || '';
    const year = req.folder?.folderYear ? String(req.folder.folderYear) : '';
    const fullIdentifier = req.folder ? `${folderNumber}/${folderSymbol}/${year}` : '';

    return {
      id: req.requestTransferId,
      fromUser: req.createdBy ? `${req.createdBy.firstName} ${req.createdBy.lastName}` : '',
      toUser: req.handledBy ? `${req.handledBy.firstName} ${req.handledBy.lastName}` : '',
      fileId: fullIdentifier,
      statusTrans: t(req.status || 'PENDING'),
      date: req.requestDate
    };
  });

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
            <DropdownMenuItem onClick={() => exportToCSV(getTranslatedRequests() as unknown as Record<string, string>[], exportHeaders, 'my-requests')}>
              <FileSpreadsheet className="w-4 h-4 me-2" /> {t('exportCSV')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={async () => await exportToPDF(getTranslatedRequests() as unknown as Record<string, string>[], exportHeaders, 'my-requests', t('myTransfersLog'))}>
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
            <SelectItem value="accepted">{t('ACCEPTED')}</SelectItem>
            <SelectItem value="rejected">{t('REJECTED')}</SelectItem>
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
              ) : paginated.map((req) => (
                <TableRow key={req.requestTransferId}>
                  <TableCell className="font-medium">#{req.requestTransferId}</TableCell>
                  <TableCell>
                    {tab === 'sent'
                      ? (req.handledBy ? `${req.handledBy.firstName} ${req.handledBy.lastName}` : '')
                      : (req.createdBy ? `${req.createdBy.firstName} ${req.createdBy.lastName}` : '')}
                  </TableCell>
                  <TableCell>
                    {req.folder 
                      ? `${req.folder.folderNumber}/${req.folder.folderSymbol}/${req.folder.folderYear ? String(req.folder.folderYear) : ''}`
                      : ''}
                  </TableCell>
                  <TableCell>{statusBadge(req.status)}</TableCell>
                  <TableCell>{req.requestDate}</TableCell>
                  {tab === 'received' && (
                    <TableCell className="text-end">
                      {req.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(req);
                            setDecisionModalOpen(true);
                          }}
                        >
                          {t('decision')}
                        </Button>
                      )}
                      {req.status === 'ACCEPTED' && isSessionClerk && req.folder && (
                        <div className="flex justify-end">
                          <Select
                            value={req.folder.statuts}
                            onValueChange={(val) => handleFolderStatusChange(req.folder.folderId, val)}
                          >
                            <SelectTrigger className="w-40 h-8 text-xs">
                              <SelectValue placeholder={t('selectStatus')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="IN_SESSION">{t('IN_SESSION')}</SelectItem>
                              <SelectItem value="IN_DELIBERATION">{t('IN_DELIBERATION')}</SelectItem>
                              <SelectItem value="DRAFTED">{t('DRAFTED')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t('showing')} {myRequests.length > 0 ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, myRequests.length)} {t('of')} {myRequests.length}
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

      {/* Decision Modal */}
      <Dialog open={decisionModalOpen} onOpenChange={(open) => { setDecisionModalOpen(open); if (!open) setSelectedRequest(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-start rtl:text-end">{t('decisionModalTitle')}</DialogTitle>
            <DialogDescription className="text-start rtl:text-end">
              {t('decisionModalDesc')}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="py-4 space-y-3 text-start rtl:text-end text-sm">
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border">
                <span className="font-semibold text-muted-foreground">{t('file')}:</span>
                <span className="col-span-2 font-medium">
                  {selectedRequest.folder 
                    ? `${selectedRequest.folder.folderNumber}/${selectedRequest.folder.folderSymbol}/${selectedRequest.folder.folderYear ? String(selectedRequest.folder.folderYear) : ''}`
                    : ''}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border">
                <span className="font-semibold text-muted-foreground">{t('fromUser')}:</span>
                <span className="col-span-2">
                  {selectedRequest.createdBy ? `${selectedRequest.createdBy.firstName} ${selectedRequest.createdBy.lastName}` : ''}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border">
                <span className="font-semibold text-muted-foreground">{t('date')}:</span>
                <span className="col-span-2">{selectedRequest.requestDate}</span>
              </div>
              <div className="space-y-1 py-1.5">
                <span className="font-semibold text-muted-foreground block">{t('purpose')}:</span>
                <span className="block text-foreground bg-accent/40 p-2.5 rounded-md min-h-[40px]">
                  {selectedRequest.purpose || '-'}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-row gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => handleDecision('REJECTED')}
              disabled={isSubmitting}
              className="flex-1 bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20 gap-1.5"
            >
              <X className="w-4 h-4" />
              {t('reject')}
            </Button>
            <Button
              onClick={() => handleDecision('ACCEPTED')}
              disabled={isSubmitting}
              className="flex-1 bg-success text-success-foreground hover:bg-success/90 gap-1.5"
            >
              <Check className="w-4 h-4" />
              {t('accept')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyTransfersPage;
