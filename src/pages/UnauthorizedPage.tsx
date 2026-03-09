import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center gap-6 p-8 bg-background">
      <div className="rounded-full bg-destructive/10 p-6">
        <ShieldX className="h-16 w-16 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold text-foreground">
        {t('unauthorized', 'غير مصرح بالوصول')}
      </h1>
      <p className="text-muted-foreground max-w-md text-lg">
        {t('unauthorizedDesc', 'ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة. تواصل مع المسؤول إذا كنت تعتقد أن هذا خطأ.')}
      </p>
      <Button onClick={() => navigate('/dashboard')} size="lg">
        {t('backToDashboard', 'العودة إلى لوحة التحكم')}
      </Button>
    </div>
  );
};

export default UnauthorizedPage;
