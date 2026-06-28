import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFiles, useUsers, useRequestTransfers } from '@/hooks/use-api';
import { useAuth } from '@/contexts/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

const ReferFilePage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth(); // Logged in user
  const { files, isLoading: filesLoading } = useFiles('available');
  const { users, isLoading: usersLoading } = useUsers();
  const { addRequestTransfer } = useRequestTransfers();
  
  const [form, setForm] = useState({ fileId: '', toUser: '' });
  const [open, setOpen] = useState(false);
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

    if (!folder) {
      setErrors({ fileId: t('folderNotFound') });
      return;
    }
    if (!toUser) {
      setErrors({ toUser: t('userNotFound') });
      return;
    }

    const requestData = {
      folderId: Number(folder.id),
      handledById: Number(toUser.id),
      purpose: 'File Referral',
      requestDate: new Date().toISOString().split('T')[0]
    };

    addRequestTransfer(requestData, {
      onSuccess: () => {
        toast({ title: t('transferAdded') });
        navigate('/my-transfers');
      },
      onError: (error: any) => {
        const errorMsg = error.message || '';
        let displayMsg = '';
        
        if (errorMsg.includes('PENDING_TRANSFER_EXISTS')) {
          displayMsg = t('pendingTransferExists');
        } else if (errorMsg.includes('ONLY_PENDING_REQUESTS_CAN_BE_DELETED')) {
          displayMsg = t('onlyPendingRequestsCanBeDeleted');
        } else if (errorMsg.startsWith('RequestTransfer not found')) {
          displayMsg = t('requestTransferNotFound');
        } else {
          const translated = t(errorMsg);
          displayMsg = translated === errorMsg ? t('unexpectedError') : translated;
        }
        
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
          <div className="space-y-1.5 flex flex-col">
            <Label>{t('selectFile')}</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={`w-full justify-between font-normal text-start ${errors.fileId ? 'border-destructive' : ''}`}
                >
                  {form.fileId
                    ? files.find((f) => f.folderNumber === form.fileId)
                      ? `${files.find((f) => f.folderNumber === form.fileId)?.folderNumber}/${files.find((f) => f.folderNumber === form.fileId)?.folderSymbol}/${files.find((f) => f.folderNumber === form.fileId)?.folderYear || ''}`
                      : t('selectOption')
                    : t('selectOption')}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder={t('search')} />
                  <CommandList>
                    <CommandEmpty>{t('noData')}</CommandEmpty>
                    <CommandGroup>
                      {files.map((f) => {
                        const label = `${f.folderNumber}/${f.folderSymbol}/${f.folderYear || ''}`;
                        return (
                          <CommandItem
                            key={f.id}
                            value={label}
                            onSelect={() => {
                              setForm({ ...form, fileId: f.folderNumber });
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${form.fileId === f.folderNumber ? 'opacity-100' : 'opacity-0'}`}
                            />
                            {label}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
