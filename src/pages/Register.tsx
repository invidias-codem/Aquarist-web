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

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  if (session) {
    return null;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      toast.error('Please complete the security challenge.');
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken,
        emailRedirectTo: 'http://localhost:5173/auth/callback',
      }
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      setShowConfirmation(true);
    }
  };

  if (showConfirmation) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Metallic Modal Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md p-1 rounded-xl bg-gradient-to-br from-gray-500 via-gray-900 to-gray-600 shadow-2xl shadow-black">
            <div className="bg-card/95 backdrop-blur-md rounded-lg p-8 flex flex-col items-center text-center space-y-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-700 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-300 text-transparent bg-clip-text">Check Your Email</h2>
                <p className="text-muted-foreground">
                  We've sent a secure verification link to <span className="text-foreground font-medium">{email}</span>. You must verify your email before logging in.
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  (For local dev, check Inbucket at localhost:54324)
                </p>
              </div>
              <Button onClick={() => navigate('/login')} className="w-full font-semibold bg-gradient-to-r from-zinc-700 to-zinc-900 text-zinc-200 border border-zinc-600 hover:from-zinc-600 hover:to-zinc-800 transition-all duration-300">
                Proceed to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-lg shadow-black/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Create an account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign up to start tracking your aquarium water parameters.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
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
              <Label htmlFor="password">Password</Label>
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
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
