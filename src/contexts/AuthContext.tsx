import { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'admin' | 'employee';

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  username: string;
  setUsername: (name: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  role: 'admin',
  setRole: () => {},
  username: '',
  setUsername: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('userRole') as UserRole) || 'admin';
  });
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || '';
  });

  const handleSetRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('userRole', newRole);
  };

  const handleSetUsername = (name: string) => {
    setUsername(name);
    localStorage.setItem('username', name);
  };

  return (
    <AuthContext.Provider value={{ role, setRole: handleSetRole, username, setUsername: handleSetUsername }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
