import { createContext, useEffect, useState, ReactNode } from "react";
import { 
  User,
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<User | null>;
  loginWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  loginWithEmail: async () => null,
  loginWithGoogle: async () => null,
  logout: async () => {},
  signup: async () => null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithEmail = async (email: string, password: string): Promise<User | null> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login successful",
        description: "Welcome back!",
        variant: "default",
      });
      return result.user;
    } catch (error) {
      const errorMessage = (error as Error).message;
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const loginWithGoogle = async (): Promise<User | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      toast({
        title: "Login successful",
        description: "Welcome to Al-Haramain Modern Paints ERP!",
        variant: "default",
      });
      return result.user;
    } catch (error) {
      const errorMessage = (error as Error).message;
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const signup = async (email: string, password: string): Promise<User | null> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "Account created",
        description: "Your account has been successfully created!",
        variant: "default",
      });
      return result.user;
    } catch (error) {
      const errorMessage = (error as Error).message;
      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        variant: "default",
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      toast({
        title: "Logout failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const value = {
    currentUser,
    loading,
    loginWithEmail,
    loginWithGoogle,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
