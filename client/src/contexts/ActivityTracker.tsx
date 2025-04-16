import { createContext, useContext, useEffect, ReactNode, useState } from "react";
import { useAuth } from "./AuthContext";
import { logout } from "../lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Timeout in milliseconds (10 minutes)
const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

interface ActivityContextType {
  resetTimer: () => void;
}

const ActivityContext = createContext<ActivityContextType>({
  resetTimer: () => {},
});

export function useActivity() {
  return useContext(ActivityContext);
}

interface ActivityProviderProps {
  children: ReactNode;
}

export function ActivityProvider({ children }: ActivityProviderProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timer) clearTimeout(timer);
    if (currentUser) {
      const newTimer = setTimeout(handleInactivity, INACTIVITY_TIMEOUT);
      setTimer(newTimer);
    }
  };

  const handleInactivity = async () => {
    if (currentUser) {
      try {
        await logout();
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity",
        });
        setLocation("/login");
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  useEffect(() => {
    // Set up event listeners for user activity
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    
    // Start the timer when user is logged in
    if (currentUser) {
      resetTimer();
      
      // Add event listeners
      events.forEach(event => {
        window.addEventListener(event, resetTimer);
      });
      
      // Clean up
      return () => {
        if (timer) clearTimeout(timer);
        events.forEach(event => {
          window.removeEventListener(event, resetTimer);
        });
      };
    } else {
      // Clear the timer when user logs out
      if (timer) clearTimeout(timer);
    }
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    resetTimer,
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}
