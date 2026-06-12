import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NavLink } from '@/components/NavLink';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

const routeTranslations: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/users': 'userManagement',
  '/files': 'fileManagement',
  '/transfers': 'transferManagement',
  '/my-transfers': 'myTransfersLog',
  '/refer-file': 'referFile',
  '/system-logs': 'systemLogs',
};

export const AppBreadcrumb = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const isHome = location.pathname === '/dashboard';

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          {isHome ? (
            <BreadcrumbPage className="flex items-center gap-1.5">
              <Home className="w-4 h-4" />
              {t('dashboard')}
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <NavLink to="/dashboard" className="flex items-center gap-1.5 hover:text-foreground">
                <Home className="w-4 h-4" />
                {t('dashboard')}
              </NavLink>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {pathSegments.map((segment, index) => {
          const path = '/' + pathSegments.slice(0, index + 1).join('/');
          const isLast = index === pathSegments.length - 1;
          const translationKey = routeTranslations[path] || segment;

          return (
            <React.Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{t(translationKey)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <NavLink to={path} className="hover:text-foreground">
                      {t(translationKey)}
                    </NavLink>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
