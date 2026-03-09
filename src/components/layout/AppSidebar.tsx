import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Users, FolderOpen, ArrowRightLeft, ClipboardList, X, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  open: boolean;
  onToggle: () => void;
  isRtl: boolean;
}

const menuItems = [
  { key: 'dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { key: 'userManagement', icon: Users, path: '/users' },
  { key: 'fileManagement', icon: FolderOpen, path: '/files' },
  { key: 'transferManagement', icon: ArrowRightLeft, path: '/transfers' },
];

export const AppSidebar = ({ open, onToggle, isRtl }: AppSidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed md:sticky top-0 z-50 h-screen flex flex-col border-border bg-card transition-all duration-300 shrink-0",
          isRtl ? "border-l right-0" : "border-r left-0",
          open ? "w-64" : "w-0 md:w-16",
          "overflow-hidden"
        )}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-border shrink-0">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className={cn("overflow-hidden transition-all", open ? "w-auto opacity-100" : "w-0 opacity-0")}>
            <p className="text-sm font-semibold text-foreground whitespace-nowrap">{t('ministryTitle')}</p>
            <p className="text-xs text-muted-foreground whitespace-nowrap">{t('platformTitle')}</p>
          </div>
          <button onClick={onToggle} className="md:hidden ms-auto text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.key}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) onToggle();
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className={cn("transition-all whitespace-nowrap", open ? "opacity-100" : "opacity-0 w-0")}>
                  {t(item.key)}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
