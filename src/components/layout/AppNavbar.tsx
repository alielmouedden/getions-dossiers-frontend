import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Sun, Moon, Globe, LogOut, User, Bell, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

import { useNavigate } from 'react-router-dom';

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
  const { user } = useAuth();
  const { notifications: rawNotifications } = useNotifications();

  const [clearedIds, setClearedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('clearedNotifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastSeenCount, setLastSeenCount] = useState(0);

  const navigate = useNavigate();

  const notifications = rawNotifications
    .filter(n => n.status === 'PENDING')
    .filter(n => !clearedIds.includes(String(n.requestTransferId)))
    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
    .slice(0, 5)
    .map(n => {
      const folderNumber = n.folder 
        ? `${n.folder.folderNumber}/${n.folder.folderSymbol}/${n.folder.folderYear || ''}`
        : '';
      const senderName = n.createdBy ? `${n.createdBy.firstName} ${n.createdBy.lastName}` : '';
      return {
        id: String(n.requestTransferId),
        type: 'received',
        message: `${t('transferReceived')} ${senderName ? `(${senderName})` : ''}`,
        time: n.requestDate,
        folderNumber: folderNumber,
      };
    });

  const unreadCount = notifications.length > lastSeenCount ? notifications.length - lastSeenCount : 0;

  const handleClearAll = () => {
    const newCleared = [...clearedIds, ...notifications.map(n => n.id)];
    setClearedIds(newCleared);
    localStorage.setItem('clearedNotifications', JSON.stringify(newCleared));
    setLastSeenCount(0);
  };

  const handleNotificationClick = (folderNumber?: string) => {
    navigate('/my-transfers', { state: { tab: 'received' } });
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 sticky top-0 z-50">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="text-muted-foreground hover:text-foreground">
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu dir={language === 'ar' ? 'rtl' : 'ltr'} onOpenChange={(open) => {
          if (open) setLastSeenCount(notifications.length);
        }}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="px-4 py-3 bg-accent/50 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                {t('notifications')}
              </h3>
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-7 text-[10px] px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                  {t('clear')}
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif, index) => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleNotificationClick(notif.folderNumber)}
                    className={`flex items-start gap-3 p-4 hover:bg-accent/30 cursor-pointer transition-colors ${
                      index !== notifications.length - 1 ? 'border-b border-border/50' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      notif.type === 'transfer' 
                        ? 'bg-info/15 ring-2 ring-info/20' 
                        : 'bg-success/15 ring-2 ring-success/20'
                    }`}>
                      {notif.type === 'transfer' ? (
                        <FileText className="w-5 h-5 text-info" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-success" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium text-foreground leading-relaxed">{notif.message}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                        {notif.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t('noNotifications')}</p>
                </div>
              )}
            </div>
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
              <span className="hidden md:inline text-sm">
                {user ? `${user.firstName} ${user.lastName}` : t('user')}
              </span>
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
