import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { getCurrentUser, readDb, setCurrentUser, writeDb, type KycState, type PlatformUser } from "@/lib/platform";

interface AuthContextType {
  user: PlatformUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (_email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  refreshUser: () => void;
  updateKycState: (state: KycState) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<PlatformUser | null>(() => getCurrentUser());

  const refreshUser = () => setUser(getCurrentUser());

  const signIn = async (email: string, password: string) => {
    const db = readDb();
    const found = db.users.find((u) => u.email === email && u.password === password);
    if (!found) return { error: new Error("Invalid credentials") };
    found.sessionExpiresAt = Date.now() + 1000 * 60 * 60;
    writeDb(db);
    setCurrentUser(found.id);
    setUser(found);
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    const db = readDb();
    if (db.users.some((u) => u.email === email)) return { error: new Error("Account already exists") };
    const created: PlatformUser = {
      id: crypto.randomUUID(),
      email,
      password,
      name: email.split("@")[0],
      role: "client",
      sessionExpiresAt: Date.now() + 1000 * 60 * 60,
      kycState: "not_started",
      entitlements: [],
    };
    db.users.push(created);
    writeDb(db);
    setCurrentUser(created.id);
    setUser(created);
    return { error: null };
  };

  const signOut = async () => {
    setCurrentUser(null);
    setUser(null);
  };

  const resetPassword = async () => ({ error: null });

  const updatePassword = async (password: string) => {
    if (!user) return { error: new Error("Not authenticated") };
    const db = readDb();
    const found = db.users.find((u) => u.id === user.id);
    if (!found) return { error: new Error("User not found") };
    found.password = password;
    writeDb(db);
    setUser(found);
    return { error: null };
  };

  const updateKycState = (state: KycState) => {
    if (!user) return;
    const db = readDb();
    const found = db.users.find((u) => u.id === user.id);
    if (!found) return;
    found.kycState = state;
    writeDb(db);
    setUser(found);
  };

  const value = useMemo(
    () => ({ user, isLoading: false, signIn, signUp, signOut, resetPassword, updatePassword, refreshUser, updateKycState }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
