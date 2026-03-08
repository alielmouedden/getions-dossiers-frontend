import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { mockFiles, mockUsers } from '@/data/mock';
import { CaseFile } from '@/types';

const FilesPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [files, setFiles] = useState<CaseFile[]>(mockFiles);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [form, setForm] = useState({ fileNumber: '', folderNumber: '', createdBy: '' });

  const handleAdd = () => {
    const newFile: CaseFile = {
      id: String(files.length + 1),
      ...form,
      creationDate: date ? format(date, 'yyyy-MM-dd') : '',
    };
    setFiles([...files, newFile]);
    setOpen(false);
    setForm({ fileNumber: '', folderNumber: '', createdBy: '' });
    setDate(undefined);
    toast({ title: t('fileAdded') });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{t('fileManagement')}</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> {t('addFile')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('addFile')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>{t('fileNumber')}</Label>
                <Input value={form.fileNumber} onChange={(e) => setForm({ ...form, fileNumber: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>{t('folderNumber')}</Label>
                <Input value={form.folderNumber} onChange={(e) => setForm({ ...form, folderNumber: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>{t('createdBy')}</Label>
                <Select value={form.createdBy} onValueChange={(v) => setForm({ ...form, createdBy: v })}>
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
                <Label>{t('creationDate')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-start font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="me-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : t('creationDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
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
                <TableHead>{t('fileNumber')}</TableHead>
                <TableHead>{t('folderNumber')}</TableHead>
                <TableHead>{t('createdBy')}</TableHead>
                <TableHead>{t('creationDate')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">{file.fileNumber}</TableCell>
                  <TableCell>{file.folderNumber}</TableCell>
                  <TableCell>{file.createdBy}</TableCell>
                  <TableCell>{file.creationDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FilesPage;
