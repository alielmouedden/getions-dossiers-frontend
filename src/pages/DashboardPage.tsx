import { useTranslation } from 'react-i18next';
import { Users, FolderOpen, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { mockUsers, mockFiles, mockTransfers } from '@/data/mock';

const DashboardPage = () => {
  const { t } = useTranslation();

  const statCards = [
    { key: 'totalUsers', icon: Users, value: mockUsers.length, color: 'text-info' },
    { key: 'totalFiles', icon: FolderOpen, value: mockFiles.length, color: 'text-success' },
    { key: 'transferRequests', icon: ArrowRightLeft, value: mockTransfers.length, color: 'text-warning' },
  ];

  const monthlyData = [
    { month: t('jan'), files: 3200, transfers: 1800 },
    { month: t('feb'), files: 7500, transfers: 4200 },
    { month: t('mar'), files: 5800, transfers: 3100 },
    { month: t('apr'), files: 12000, transfers: 8500 },
    { month: t('may'), files: 15000, transfers: 11000 },
    { month: t('jun'), files: 18500, transfers: 14200 },
  ];

  const transferStatusData = [
    { name: t('completed'), value: mockTransfers.filter(t => t.status === 'completed').length || 1, fill: 'hsl(var(--success))' },
    { name: t('pending'), value: mockTransfers.filter(t => t.status === 'pending').length || 2, fill: 'hsl(var(--warning))' },
    { name: t('received'), value: mockTransfers.filter(t => t.status === 'received').length || 1, fill: 'hsl(var(--info))' },
  ];

  const roleData = [
    { name: t('admin'), value: mockUsers.filter(u => u.role === 'admin').length, fill: 'hsl(var(--primary))' },
    { name: t('employee'), value: mockUsers.filter(u => u.role === 'employee').length, fill: 'hsl(var(--info))' },
    { name: t('consultant'), value: mockUsers.filter(u => u.role === 'consultant').length, fill: 'hsl(var(--warning))' },
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
          <CardContent className="overflow-visible">
            <ChartContainer config={barChartConfig} className="h-[280px] w-full overflow-visible [&_.recharts-surface]:overflow-visible [&_.recharts-wrapper]:overflow-visible">
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" reversed />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" orientation="right" width={55} tickMargin={5} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
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
            <ChartContainer config={areaChartConfig} className="h-[220px] w-full [&_.recharts-surface]:overflow-visible [&_.recharts-wrapper]:overflow-visible">
              <AreaChart data={monthlyData} margin={{ top: 5, right: 60, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillFiles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-files)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-files)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" reversed />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" orientation="right" width={50} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
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
