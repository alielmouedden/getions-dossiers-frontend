import { useTranslation } from 'react-i18next';
import { Menu, Sun, Moon, Globe, LogOut, User, Bell, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface AppNavbarProps {
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  onLogout: () => void;
  darkMode: boolean;
  language: string;
}

export const AppNavbar = ({
  onToggleSidebar,
  onToggleTheme,
  onToggleLanguage,
  onLogout,
  darkMode,
  language,
}: AppNavbarProps) => {
  const { t } = useTranslation();

  // Mock notifications
  const notifications = [
    { id: 1, type: 'transfer', message: t('fileTransferredToYou'), time: '10:30' },
    { id: 2, type: 'received', message: t('transferReceived'), time: '09:15' },
  ];

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 sticky top-0 z-50">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="text-muted-foreground hover:text-foreground">
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="px-3 py-2 text-sm font-semibold text-foreground border-b border-border">
              {t('notifications')}
            </div>
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <DropdownMenuItem key={notif.id} className="flex items-start gap-3 py-3 cursor-pointer">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    notif.type === 'transfer' ? 'bg-info/10' : 'bg-success/10'
                  }`}>
                    {notif.type === 'transfer' ? (
                      <FileText className="w-4 h-4 text-info" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notif.time}</p>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                {t('noNotifications')}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language toggle */}
        <Button variant="ghost" size="sm" onClick={onToggleLanguage} className="gap-1.5 text-muted-foreground hover:text-foreground">
          <Globe className="w-4 h-4" />
          <span className="text-xs font-medium">{language === 'ar' ? 'FR' : 'AR'}</span>
        </Button>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={onToggleTheme} className="text-muted-foreground hover:text-foreground">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="hidden md:inline text-sm">{t('admin')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onLogout} className="gap-2 text-destructive">
              <LogOut className="w-4 h-4" />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
