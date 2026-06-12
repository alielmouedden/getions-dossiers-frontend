import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Scale, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiClient.login({ username, password });
      // response contains token, id, username, email, roles
      const userData = {
        id: String(response.id),
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        roles: response.roles
      };
      const userRoles = response.roles?.map((r: string) => r.replace('ROLE_', '').toLowerCase()) || [];
      const isAdmin = userRoles.includes('manager') || userRoles.includes('admin') || response.role === 'MANAGER';

      login(userData, response.token);
      toast({ title: t('welcome'), description: `${response.username}` });
      if (isAdmin) {
        navigate('/dashboard');
      } else {
        navigate('/my-transfers');
      }
    } catch (error: any) {
      let description = t('loginErrorGeneric');
      if (error.status === 401 || error.status === 403 || error.status === 500) {
        description = t('loginErrorInvalidCredentials');
      } else if (error.status === 0 || error.message === 'Network error') {
        description = t('loginErrorNetwork');
      } else if (error.status > 500) {
        description = t('loginErrorServer');
      }
      toast({ title: t('error'), description, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const isRtl = i18n.language === 'ar';

  return (
    <div className="min-h-screen flex bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-md">
              <Scale className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('welcome')}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t('platformTitle')}</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('username')}</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('username')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('password')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground end-3"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('loading') : t('loginBtn')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Illustration side - hidden on mobile */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-accent/50">
        <div className="text-center space-y-6 p-8">
          <div className="w-32 h-32 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center">
            <Scale className="w-16 h-16 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">{t('ministryTitle')}</h2>
            <p className="text-muted-foreground mt-2 text-lg">{t('platformTitle')}</p>
          </div>
          <div className="flex gap-3 justify-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-primary/30" />
            ))}
            <div className="w-3 h-3 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
