import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export const useInactivityTimer = (timeout: number) => {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    if (currentUser) {
      timerRef.current = setTimeout(() => {
        logout();
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity.",
          variant: "default",
        });
      }, timeout);
    }
  };

  useEffect(() => {
    // Setup event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Reset timer when user is active
    const handleUserActivity = () => {
      resetTimer();
    };
    
    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });
    
    // Initialize timer
    resetTimer();
    
    // Cleanup function
    return () => {
      // Remove event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      
      // Clear timeout
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentUser, timeout, logout]);
};
