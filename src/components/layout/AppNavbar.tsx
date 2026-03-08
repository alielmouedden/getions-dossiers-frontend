import { useTranslation } from 'react-i18next';
import { Menu, Sun, Moon, Globe, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="text-muted-foreground hover:text-foreground">
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-2">
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
