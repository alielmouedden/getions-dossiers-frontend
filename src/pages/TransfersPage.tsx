import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { mockTransfers, mockUsers, mockFiles } from '@/data/mock';
import { Transfer, TransferStatus } from '@/types';

const TransfersPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [transfers, setTransfers] = useState<Transfer[]>(mockTransfers);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fromUser: '', toUser: '', fileId: '', status: 'pending' as TransferStatus });

  const handleAdd = () => {
    const newTransfer: Transfer = {
      id: String(transfers.length + 1),
      ...form,
      date: new Date().toISOString().split('T')[0],
    };
    setTransfers([...transfers, newTransfer]);
    setOpen(false);
    setForm({ fromUser: '', toUser: '', fileId: '', status: 'pending' });
    toast({ title: t('transferAdded') });
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-success/10 text-success border-success/20',
      pending: 'bg-warning/10 text-warning border-warning/20',
      received: 'bg-info/10 text-info border-info/20',
    };
    return <Badge variant="outline" className={styles[status]}>{t(status)}</Badge>;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{t('transferManagement')}</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> {t('addTransfer')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('addTransfer')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>{t('selectFile')}</Label>
                <Select value={form.fileId} onValueChange={(v) => setForm({ ...form, fileId: v })}>
                  <SelectTrigger><SelectValue placeholder={t('selectFile')} /></SelectTrigger>
                  <SelectContent>
                    {mockFiles.map((f) => (
                      <SelectItem key={f.id} value={f.fileNumber}>{f.fileNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t('fromUser')}</Label>
                <Select value={form.fromUser} onValueChange={(v) => setForm({ ...form, fromUser: v })}>
                  <SelectTrigger><SelectValue placeholder={t('selectUser')} /></SelectTrigger>
                  <SelectContent>
                    {mockUsers.map((u) => (
                      <SelectItem key={u.id} value={`${u.firstName} ${u.lastName}`}>
                        {u.firstName} {u.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t('toUser')}</Label>
                <Select value={form.toUser} onValueChange={(v) => setForm({ ...form, toUser: v })}>
                  <SelectTrigger><SelectValue placeholder={t('selectUser')} /></SelectTrigger>
                  <SelectContent>
                    {mockUsers.map((u) => (
                      <SelectItem key={u.id} value={`${u.firstName} ${u.lastName}`}>
                        {u.firstName} {u.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t('status')}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TransferStatus })}>
                  <SelectTrigger><SelectValue placeholder={t('selectStatus')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('pending')}</SelectItem>
                    <SelectItem value="received">{t('received')}</SelectItem>
                    <SelectItem value="completed">{t('completed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAdd} className="flex-1">{t('save')}</Button>
                <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">{t('cancel')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((tr) => (
                <TableRow key={tr.id}>
                  <TableCell className="font-medium">#{tr.id}</TableCell>
                  <TableCell>{tr.fromUser}</TableCell>
                  <TableCell>{tr.toUser}</TableCell>
                  <TableCell>{tr.fileId}</TableCell>
                  <TableCell>{statusBadge(tr.status)}</TableCell>
                  <TableCell>{tr.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransfersPage;
