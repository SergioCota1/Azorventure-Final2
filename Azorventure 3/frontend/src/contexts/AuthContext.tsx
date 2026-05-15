import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useIonRouter } from '@ionic/react';
import { User } from '../services/authService';
import authService from '../services/authService';
import { initPushNotifications, resetPushNotifications } from '../services/pushNotificationsService';
import { removerPushToken } from '../services/userService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nome: string, email: string, password: string, telefone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useIonRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getProfile();
          setUser(userData);
          router.push('/home', 'root', 'replace');
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        authService.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    resetPushNotifications();
    initPushNotifications();
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      authService.setToken(response.token);
      setUser(response.user);
      
      // Verificar se o usuário tem interesses configurados
      const userProfile = await authService.getProfile();
      if (!userProfile.interesses || !userProfile.interesses.topicos || userProfile.interesses.topicos.length === 0) {
        router.push('/escolher-categorias');
      } else {
        router.push('/home');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (nome: string, email: string, password: string, telefone?: string) => {
    try {
      const response = await authService.register({ name: nome, email, password, telefone });
      authService.setToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await removerPushToken();
      resetPushNotifications();
      await authService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      authService.removeToken();
      setUser(null);
      window.location.replace('/login');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const refreshProfile = async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};