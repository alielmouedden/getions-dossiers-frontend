import { useTranslation } from 'react-i18next';
import { Users, FolderOpen, ArrowRightLeft, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockUsers, mockFiles, mockTransfers } from '@/data/mock';

const statCards = [
  { key: 'totalUsers', icon: Users, value: 5, color: 'text-info' },
  { key: 'totalFiles', icon: FolderOpen, value: 5, color: 'text-success' },
  { key: 'transferRequests', icon: ArrowRightLeft, value: 4, color: 'text-warning' },
  { key: 'deleteRequests', icon: Trash2, value: 1, color: 'text-destructive' },
];

const DashboardPage = () => {
  const { t } = useTranslation();

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: 'bg-success/10 text-success border-success/20',
      pending: 'bg-warning/10 text-warning border-warning/20',
      received: 'bg-info/10 text-info border-info/20',
    };
    return (
      <Badge variant="outline" className={variants[status] || ''}>
        {t(status)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.key} className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-sm text-muted-foreground">{t(card.key)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Files */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('recentFiles')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('fileNumber')}</TableHead>
                <TableHead>{t('folderNumber')}</TableHead>
                <TableHead>{t('createdBy')}</TableHead>
                <TableHead>{t('creationDate')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFiles.slice(0, 3).map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">{file.fileNumber}</TableCell>
                  <TableCell>{file.folderNumber}</TableCell>
                  <TableCell>{file.createdBy}</TableCell>
                  <TableCell>{file.creationDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Transfers */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('transferManagement')}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('transferId')}</TableHead>
                <TableHead>{t('fromUser')}</TableHead>
                <TableHead>{t('toUser')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransfers.slice(0, 3).map((tr) => (
                <TableRow key={tr.id}>
                  <TableCell className="font-medium">#{tr.id}</TableCell>
                  <TableCell>{tr.fromUser}</TableCell>
                  <TableCell>{tr.toUser}</TableCell>
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

export default DashboardPage;
