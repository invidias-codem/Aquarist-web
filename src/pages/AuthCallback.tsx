import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Check for code in URL search params (PKCE flow)
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          toast.error('Verification failed: ' + error.message);
          navigate('/login');
        } else {
          toast.success('Email verified successfully!');
          navigate('/dashboard');
        }
      } else {
        // Fallback: If no code, but token hash exists (Implicit flow)
        supabase.auth.getSession().then(({ data: { session }, error }) => {
          if (error) {
            toast.error('Verification failed: ' + error.message);
            navigate('/login');
          } else if (session) {
            toast.success('Email verified successfully!');
            navigate('/dashboard');
          } else {
            navigate('/login');
          }
        });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p>Verifying your secure session...</p>
      </div>
    </div>
  );
}
