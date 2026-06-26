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
import { useUsers, useFiles, useTransfers } from '@/hooks/use-api';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { users, isLoading: usersLoading } = useUsers();
  const { files: allFiles, isLoading: filesLoading } = useFiles('available');
  const { transfers: allTransfers, isLoading: transfersLoading } = useTransfers('me');

  const isAdmin = user?.role === 'MANAGER' || (user?.roles && (user.roles.includes('ROLE_MANAGER') || user.roles.includes('MANAGER')));
  const isSessionClerk = user?.role === 'SESSION_CLERK' || (user?.roles && (user.roles.includes('ROLE_SESSION_CLERK') || user.roles.includes('SESSION_CLERK')));
  const userName = user ? `${user.firstName} ${user.lastName}` : '';

  const files = allFiles;
  const transfers = allTransfers;

  const isLoading = usersLoading || filesLoading || transfersLoading;

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

  const transferStatusData = [
    { name: t('completed'), value: transfers.filter(t => t.status === 'completed').length || 0, fill: 'hsl(var(--success))' },
    { name: t('pending'), value: transfers.filter(t => t.status === 'pending').length || 0, fill: 'hsl(var(--warning))' },
    { name: t('received'), value: transfers.filter(t => t.status === 'received').length || 0, fill: 'hsl(var(--info))' },
  ];

  const roleData = [
    { name: t('MANAGER'), value: users.filter(u => u.role === 'MANAGER').length, fill: 'hsl(var(--primary))' },
    { name: t('CLERK'), value: users.filter(u => u.role === 'CLERK').length, fill: 'hsl(var(--info))' },
    { name: t('SESSION_CLERK'), value: users.filter(u => u.role === 'SESSION_CLERK').length, fill: 'hsl(var(--warning))' },
    { name: t('ARCHIVE_OFFICER'), value: users.filter(u => u.role === 'ARCHIVE_OFFICER').length, fill: 'hsl(var(--success))' },
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

        {/* Transfer Status Pie */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('transfersByStatus')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChartContainer config={{ completed: { label: t('completed'), color: 'hsl(var(--success))' }, pending: { label: t('pending'), color: 'hsl(var(--warning))' }, received: { label: t('received'), color: 'hsl(var(--info))' } }} className="h-[200px] w-full">
              <PieChart>
                <Pie
                  data={transferStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {transferStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex gap-4 mt-2">
              {transferStatusData.map((item) => (
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

        {/* Users by Role Pie */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('usersByRole')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChartContainer config={{ admin: { label: t('admin'), color: 'hsl(var(--primary))' }, employee: { label: t('employee'), color: 'hsl(var(--info))' }, consultant: { label: t('consultant'), color: 'hsl(var(--warning))' } }} className="h-[160px] w-full">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {roleData.map((item) => (
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
              {files.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">{t('noData')}</TableCell></TableRow>
              ) : files.slice(0, 3).map((file, index) => (
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
              {transfers.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">{t('noData')}</TableCell></TableRow>
              ) : transfers.slice(0, 3).map((tr, index) => (
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
  );
};

export default DashboardPage;
