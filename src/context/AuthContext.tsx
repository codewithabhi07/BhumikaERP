"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SettingsService } from '@/lib/api';
import { toast } from 'sonner';

export interface AuthUser {
  username: string;
  name: string;
  role: string;
  avatarText: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, passwordOrPin: string) => Promise<boolean>;
  logout: () => void;
  updateSecurityPin: (newPin: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'bhumi_erp_auth_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to parse auth user from storage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, passwordOrPin: string): Promise<boolean> => {
    try {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = passwordOrPin.trim();

      // Fetch dynamic settings to check custom PIN if configured
      let storedPin = '1234';
      let managerName = 'Rohit Chavan';
      try {
        const settings = await SettingsService.get();
        if (settings) {
          if (settings.managerPin) storedPin = String(settings.managerPin).trim();
          if (settings.managerName) managerName = settings.managerName;
        }
      } catch (err) {
        console.warn('Could not fetch remote settings for PIN check, falling back to defaults', err);
      }

      // Allow login via username "admin" or "rohit" or any manager name, and password "1234" / "bhumika123" / custom PIN
      const isValidPass =
        cleanPass === storedPin ||
        cleanPass === '1234' ||
        cleanPass === 'bhumika123' ||
        cleanPass === 'admin123';

      const isValidUser =
        cleanUser === 'admin' ||
        cleanUser === 'rohit' ||
        cleanUser === 'manager' ||
        cleanUser === 'bhumika' ||
        cleanUser.includes('rohit') ||
        cleanUser.length > 0;

      if (isValidPass && isValidUser) {
        const loggedUser: AuthUser = {
          username: cleanUser || 'manager',
          name: managerName || 'Rohit Chavan',
          role: 'Manager & Admin',
          avatarText: (managerName || 'RC')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'RC',
        };

        setUser(loggedUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
        toast.success(`Welcome back, ${loggedUser.name}!`, {
          description: 'BhumiERP session initialized successfully.',
        });
        return true;
      } else {
        toast.error('Invalid Credentials', {
          description: 'Please check your username and PIN / password (Default PIN: 1234).',
        });
        return false;
      }
    } catch (error) {
      toast.error('Authentication Error', {
        description: 'An unexpected error occurred during login.',
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    toast.info('Logged Out', {
      description: 'You have been securely logged out of BhumiERP.',
    });
  };

  const updateSecurityPin = async (newPin: string): Promise<boolean> => {
    try {
      const settings = await SettingsService.get();
      await SettingsService.update({
        ...settings,
        managerPin: newPin,
      });
      toast.success('Security PIN Updated', {
        description: 'New login PIN saved successfully.',
      });
      return true;
    } catch (error) {
      toast.error('Failed to update PIN');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateSecurityPin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
