'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  balance: number;
  setBalance: (balance: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(12459.83);

  return (
    <AppContext.Provider value={{ balance, setBalance }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}