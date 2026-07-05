import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { toast } from 'sonner';
import { Turnstile } from '@marsidev/react-turnstile';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const { session } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect
  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  if (session) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      toast.error('Please complete the security challenge.');
      return;
    }
    setLoading(true);

    // Check if locked out
    const { data: isLockedOut } = await supabase.rpc('check_lockout', { user_email: email });
    if (isLockedOut) {
      toast.error('Account locked due to too many failed attempts. Please try again in 15 minutes.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken,
      }
    });

    if (error) {
      // Record failed attempt
      await supabase.rpc('record_failed_login', { user_email: email });
      toast.error(error.message);
      setLoading(false);
    } else {
      // Clear failed attempts
      await supabase.rpc('clear_failed_logins', { user_email: email });
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }
    if (!captchaToken) {
      toast.error('Please complete the security challenge.');
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: 'http://localhost:5173/auth/callback',
        captchaToken,
      }
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Confirmation email resent! Please check your inbox.');
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-lg shadow-black/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Sign in to Aquarist</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email and password to access your tanks.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-border focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/reset-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-border focus-visible:ring-primary"
              />
            </div>
            <div className="flex justify-center pt-2">
              <Turnstile 
                siteKey="1x00000000000000000000AA"
                onSuccess={(token) => setCaptchaToken(token)}
                options={{ theme: 'dark' }}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : 'Sign In'}
            </Button>
            <Button type="button" variant="outline" className="w-full border-border hover:bg-accent text-muted-foreground" onClick={handleResend} disabled={loading}>
              Resend confirmation email
            </Button>
            <div className="text-sm text-center text-muted-foreground pt-2">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
