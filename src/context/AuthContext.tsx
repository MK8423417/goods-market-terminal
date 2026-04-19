import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserProfile = {
  // Basic
  id: string;
  name?: string;
  email: string;
  businessName: string;
  businessType?: string;
  
  // Business Config
  taxId?: string;
  deliveryAddress?: string;
  operatingHours?: string;
  monthlyBudgetAlert?: number;
  
  // Market Prefs
  favoriteSuppliers?: string[];
  priceChangeThreshold?: number;
  currency?: string;
  weightUnit?: string;
  
  // Alerts
  priceDropNotificationToggle?: string; // 'in-app' | 'email'
  lowInventoryAlerts?: boolean;
  marketSummary?: boolean;
  
  // Experience
  tickSpeed?: number;
};

type AuthContextType = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  register: (data: Omit<UserProfile, 'id'>) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'supplytrade_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [user]);

  const login = (email: string) => {
    // In a real app we'd verify password. Here we simulate finding the user or just mock it.
    // For simplicity, if they login, we look in localStorage for 'supplytrade_users_db' or just recreate it.
    const allUsersStr = localStorage.getItem('supplytrade_users_db');
    const allUsers = allUsersStr ? JSON.parse(allUsersStr) : [];
    const foundUser = allUsers.find((u: UserProfile) => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
    } else {
      // Mock failure or just create a dummy one for smooth testing
      alert("Account not found. Please sign up.");
    }
  };

  const register = (data: Omit<UserProfile, 'id'>) => {
    const newUser: UserProfile = {
      ...data,
      id: crypto.randomUUID()
    };
    
    const allUsersStr = localStorage.getItem('supplytrade_users_db');
    const allUsers = allUsersStr ? JSON.parse(allUsersStr) : [];
    allUsers.push(newUser);
    localStorage.setItem('supplytrade_users_db', JSON.stringify(allUsers));
    
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    
    const allUsersStr = localStorage.getItem('supplytrade_users_db');
    if (allUsersStr) {
      let allUsers = JSON.parse(allUsersStr);
      allUsers = allUsers.map((u: UserProfile) => u.id === updated.id ? updated : u);
      localStorage.setItem('supplytrade_users_db', JSON.stringify(allUsers));
    }
    
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
