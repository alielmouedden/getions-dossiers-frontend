import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFiles, useUsers, useTransfers } from '@/hooks/use-api';
import { useAuth } from '@/contexts/AuthContext';

const ReferFilePage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth(); // Logged in user
  const { files, isLoading: filesLoading } = useFiles('available');
  const { users, isLoading: usersLoading } = useUsers();
  const { addTransfer } = useTransfers();
  
  const [form, setForm] = useState({ fileId: '', toUser: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isLoading = filesLoading || usersLoading;

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fileId) newErrors.fileId = t('required');
    if (!form.toUser) newErrors.toUser = t('required');
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const folder = files.find(f => f.folderNumber === form.fileId);
    const toUser = users.find(u => `${u.firstName} ${u.lastName}` === form.toUser);

    const transferData = {
      folder: folder ? { folderId: Number(folder.id) } : null,
      toUser: toUser ? { userId: Number(toUser.id) } : null,
      purpose: 'File Referral',
      transferDate: new Date().toISOString().split('T')[0],
      status: 'PENDING'
    };

    addTransfer(transferData, {
      onSuccess: () => {
        toast({ title: t('transferAdded') });
        navigate('/my-transfers');
      },
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

  const FieldError = ({ error }: { error?: string }) =>
    error ? <p className="text-xs text-destructive mt-1">{error}</p> : null;

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground">{t('referFile')}</h2>

      <Card className="border-border shadow-sm max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">{t('newFileReferral')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Select File */}
          <div className="space-y-1.5">
            <Label>{t('selectFile')}</Label>
            <Select value={form.fileId} onValueChange={(v) => setForm({ ...form, fileId: v })}>
              <SelectTrigger className={errors.fileId ? 'border-destructive' : ''}>
                <SelectValue placeholder={t('selectOption')} />
              </SelectTrigger>
              <SelectContent>
                {files.map((f) => (
                  <SelectItem key={f.id} value={f.folderNumber}>{f.folderNumber}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError error={errors.fileId} />
          </div>

          {/* From User (read-only) */}
          <div className="space-y-1.5">
            <Label>{t('fromUser')}</Label>
            <Input value={user ? `${user.firstName} ${user.lastName}` : ''} disabled className="bg-muted" />
          </div>

          {/* To User */}
          <div className="space-y-1.5">
            <Label>{t('toUser')}</Label>
            <Select value={form.toUser} onValueChange={(v) => setForm({ ...form, toUser: v })}>
              <SelectTrigger className={errors.toUser ? 'border-destructive' : ''}>
                <SelectValue placeholder={t('selectOption')} />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter(u => u.username !== user?.username)
                  .map((u) => (
                    <SelectItem key={u.id} value={`${u.firstName} ${u.lastName}`}>
                      {u.firstName} {u.lastName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <FieldError error={errors.toUser} />
          </div>

          {/* Status (read-only) */}
          <div className="space-y-1.5">
            <Label>{t('status')}</Label>
            <Input value={t('pendingReceipt')} disabled className="bg-muted" />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} className="gap-2">
              <Send className="w-4 h-4" />
              {t('sendReferral')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/my-transfers')}>
              {t('cancel')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferFilePage;
