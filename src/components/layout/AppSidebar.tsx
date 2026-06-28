import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Users, FolderOpen, ArrowRightLeft, ClipboardList, Send, ScrollText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface AppSidebarProps {
  open: boolean;
  onToggle: () => void;
  isRtl: boolean;
}

const menuItems = [
  { key: 'dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'manager'] },
  { key: 'userManagement', icon: Users, path: '/users', roles: ['admin', 'manager'] },
  { key: 'fileManagement', icon: FolderOpen, path: '/files', roles: ['admin', 'manager', 'clerk'] },
  { key: 'transferManagement', icon: ArrowRightLeft, path: '/transfers', roles: ['admin', 'manager'] },
  { key: 'myTransfersLog', icon: ClipboardList, path: '/my-transfers', roles: ['admin', 'manager', 'clerk', 'session_clerk'] },
  { key: 'referFile', icon: Send, path: '/refer-file', roles: ['clerk', 'session_clerk'] },
  { key: 'systemLogs', icon: ScrollText, path: '/system-logs', roles: ['admin', 'manager'] },
];

export const AppSidebar = ({ open, onToggle, isRtl }: AppSidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  
  const roles = user?.roles?.map(r => r.replace('ROLE_', '').toLowerCase()) || 
                (user?.role ? [user.role.toLowerCase()] : []);
                
  const userRolesMapped = roles.flatMap(role => {
    if (role === 'manager' || role === 'admin') {
      return ['admin', 'manager'];
    }
    return [role];
  });
  
  const visibleItems = menuItems.filter(item => 
    item.roles.some(r => userRolesMapped.includes(r.toLowerCase()))
  );

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
        <div className="h-16 flex items-center justify-center relative px-4 border-b border-border shrink-0">
          <img 
            src="/logo.svg" 
            alt="Justice Hub Logo" 
            className={cn(
              "shrink-0 object-contain transition-all duration-300 mx-auto",
              open ? "h-11 w-auto" : "h-9 w-9"
            )} 
          />
          <button 
            onClick={onToggle} 
            className={cn(
              "md:hidden absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
              isRtl ? "left-4" : "right-4"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
          {visibleItems.map((item) => {
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
