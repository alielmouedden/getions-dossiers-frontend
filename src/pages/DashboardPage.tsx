import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Users, FolderOpen, ArrowRightLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useUsers, useFiles, useTransfers, useRequestTransfers } from '@/hooks/use-api';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { users, isLoading: usersLoading } = useUsers();
  const { files: allFiles, isLoading: filesLoading } = useFiles('all');
  const { transfers: allTransfers, isLoading: transfersLoading } = useTransfers('all');
  const { requests: allRequests, isLoading: requestsLoading } = useRequestTransfers('all');

  const isSessionClerk = user?.role === 'SESSION_CLERK' || (user?.roles && (user.roles.includes('ROLE_SESSION_CLERK') || user.roles.includes('SESSION_CLERK')));
  const userName = user ? `${user.firstName} ${user.lastName}` : '';

  const files = allFiles;
  const transfers = allTransfers;

  const isLoading = usersLoading || filesLoading || transfersLoading || requestsLoading;

  const recentFiles = useMemo(() => {
    return [...allFiles]
      .sort((a, b) => new Date(b.creationDate || 0).getTime() - new Date(a.creationDate || 0).getTime())
      .slice(0, 5);
  }, [allFiles]);

  const recentTransfers = useMemo(() => {
    return [...allTransfers]
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, 5);
  }, [allTransfers]);

  const statCards = [
    { key: 'totalUsers', icon: Users, value: users.length, color: 'text-info' },
    { key: 'totalFiles', icon: FolderOpen, value: files.length, color: 'text-success' },
    { key: 'transferRequests', icon: ArrowRightLeft, value: transfers.length, color: 'text-warning' },
  ];

  // REAL AGGREGATION: Group files and transfers by month for the last 6 months
  const months = [5, 4, 3, 2, 1, 0].map(i => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      monthStr: d.toLocaleString('default', { month: 'short' }).toLowerCase(),
      monthName: t(d.toLocaleString('default', { month: 'short' }).toLowerCase()),
      monthIndex: d.getMonth(),
      year: d.getFullYear()
    };
  });

  const monthlyData = months.map(m => {
    const fileCount = allFiles.filter(f => {
      if (!f.creationDate) return false;
      const d = new Date(f.creationDate);
      return d.getMonth() === m.monthIndex && d.getFullYear() === m.year;
    }).length;

    const transferCount = allTransfers.filter(tr => {
      if (!tr.date) return false;
      const d = new Date(tr.date);
      return d.getMonth() === m.monthIndex && d.getFullYear() === m.year;
    }).length;

    return { month: m.monthName, files: fileCount, transfers: transferCount };
  });

  const folderStatusData = [
    { name: t('CREATION'), value: files.filter(f => f.statuts === 'CREATION').length, fill: 'hsl(var(--primary))' },
    { name: t('IN_SESSION'), value: files.filter(f => f.statuts === 'IN_SESSION').length, fill: 'hsl(var(--info))' },
    { name: t('IN_DELIBERATION'), value: files.filter(f => f.statuts === 'IN_DELIBERATION').length, fill: 'hsl(var(--warning))' },
    { name: t('DRAFTED'), value: files.filter(f => f.statuts === 'DRAFTED').length, fill: 'hsl(var(--secondary))' },
    { name: t('ARCHIVED'), value: files.filter(f => f.statuts === 'ARCHIVED').length, fill: 'hsl(var(--success))' },
  ];

  const requestStatusData = [
    { name: t('ACCEPTED'), value: allRequests.filter(r => r.status === 'ACCEPTED').length, fill: 'hsl(var(--success))' },
    { name: t('PENDING'), value: allRequests.filter(r => r.status === 'PENDING').length, fill: 'hsl(var(--warning))' },
    { name: t('REJECTED'), value: allRequests.filter(r => r.status === 'REJECTED').length, fill: 'hsl(var(--destructive))' },
  ];

  const barChartConfig = {
    files: { label: t('filesCreated'), color: 'hsl(var(--primary))' },
    transfers: { label: t('transfersMade'), color: 'hsl(var(--info))' },
  };

  const areaChartConfig = {
    files: { label: t('filesCreated'), color: 'hsl(var(--success))' },
  };

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

  if (isLoading) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

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
              <div className="flex-1">
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-sm text-muted-foreground">{t(card.key)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Activity Bar Chart */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('monthlyActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[280px] w-full overflow-visible">
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickMargin={20} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="files" fill="var(--color-files)" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="transfers" fill="var(--color-transfers)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Folder Status Pie */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('foldersByStatus')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChartContainer config={{ CREATION: { label: t('CREATION'), color: 'hsl(var(--primary))' }, IN_SESSION: { label: t('IN_SESSION'), color: 'hsl(var(--info))' }, IN_DELIBERATION: { label: t('IN_DELIBERATION'), color: 'hsl(var(--warning))' }, DRAFTED: { label: t('DRAFTED'), color: 'hsl(var(--secondary))' }, ARCHIVED: { label: t('ARCHIVED'), color: 'hsl(var(--success))' } }} className="h-[200px] w-full">
              <PieChart>
                <Pie
                  data={folderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {folderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {folderStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Files Area Chart */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('filesByMonth')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={areaChartConfig} className="h-[220px] w-full overflow-visible">
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 30, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillFiles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-files)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-files)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickMargin={20} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="files" stroke="var(--color-files)" fill="url(#fillFiles)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Request Transfers by Status Pie */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('requestsByStatus')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChartContainer config={{ ACCEPTED: { label: t('ACCEPTED'), color: 'hsl(var(--success))' }, PENDING: { label: t('PENDING'), color: 'hsl(var(--warning))' }, REJECTED: { label: t('REJECTED'), color: 'hsl(var(--destructive))' } }} className="h-[160px] w-full">
              <PieChart>
                <Pie
                  data={requestStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {requestStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {requestStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Files */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t('recentFiles')}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('fileIdentifier')}</TableHead>
                  <TableHead>{t('createdBy')}</TableHead>
                  <TableHead>{t('creationDate')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentFiles.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">{t('noData')}</TableCell></TableRow>
                ) : recentFiles.map((file, index) => (
                  <TableRow key={file.id || `file-${index}`}>
                    <TableCell className="font-medium">{`${file.folderNumber}/${file.folderSymbol}/${file.folderYear || ''}`}</TableCell>
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
                {recentTransfers.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">{t('noData')}</TableCell></TableRow>
                ) : recentTransfers.map((tr, index) => (
                  <TableRow key={tr.id || `transfer-${index}`}>
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
    </div>
  );
};

export default DashboardPage;
