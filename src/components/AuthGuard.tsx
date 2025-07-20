
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkAuth = async () => {
      try {
        // Add a small delay to prevent race conditions
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Auth error:', error);
          
          // Retry logic for transient errors
          if (retryCount < 3) {
            setRetryCount(prev => prev + 1);
            timeoutId = setTimeout(() => {
              if (mounted) checkAuth();
            }, 1000 * (retryCount + 1));
            return;
          }
          
          toast({
            title: "Authentication Error",
            description: "Please try logging in again",
            variant: "destructive",
          });
          
          timeoutId = setTimeout(() => {
            if (mounted) navigate('/login');
          }, 1000);
          return;
        }
        
        if (!session) {
          timeoutId = setTimeout(() => {
            if (mounted) navigate('/login');
          }, 500);
          return;
        }
        
        setUser(session.user);
      } catch (error) {
        console.error('Error checking auth:', error);
        
        if (mounted && retryCount < 3) {
          setRetryCount(prev => prev + 1);
          timeoutId = setTimeout(() => {
            if (mounted) checkAuth();
          }, 1000 * (retryCount + 1));
        } else if (mounted) {
          timeoutId = setTimeout(() => {
            navigate('/login');
          }, 1000);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          timeoutId = setTimeout(() => {
            if (mounted) navigate('/login');
          }, 500);
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setLoading(false);
          setRetryCount(0); // Reset retry count on successful auth
        }
      }
    );

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [navigate, retryCount, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="text-muted-foreground">
            {retryCount > 0 ? `Retrying... (${retryCount}/3)` : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : null;
};

export default AuthGuard;
