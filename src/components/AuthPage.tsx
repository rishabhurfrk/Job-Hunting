import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, User, Shield } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Pass the selected role to the signIn function
        const expectedRole = isAdmin ? 'admin' : 'user';
        const { error } = await signIn(formData.email, formData.password, expectedRole);
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
      } else {
        // For signup, always set role as 'user'
        const { error } = await signUp(formData.email, formData.password, formData.fullName, 'user');
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Logo watermark texture */}
      <div 
        className="absolute inset-0 w-full h-full opacity-[0.07]"
        style={{
          backgroundImage: `url('/logo.png')`,
          backgroundSize: '300px auto',
          backgroundRepeat: 'repeat',
          transform: 'rotate(-10deg)',
          filter: 'grayscale(100%)',
        }}
      />
      
      {/* Gradient overlay for depth */}
      <div 
        className="absolute inset-0 w-full h-full opacity-40"
        style={{
          background: 'linear-gradient(45deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 100%)',
        }}
      />

      <div className="relative mb-4 text-center">
        <img
          src="/logo.png"
          alt="Job Board Logo"
          className="w-56 h-auto mb-2"
        />
      </div>
      <Card className="w-full max-w-md bg-card/95 border-border/20 backdrop-blur-sm shadow-xl relative">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-foreground">
            {isLogin ? 'Sign In' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {isLogin 
              ? 'Welcome back! Please sign in to your account.' 
              : 'Join our job listing platform today.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Role Toggle - Only show for login */}
            {isLogin && (
              <div className="flex items-center justify-center space-x-4 p-2 bg-background rounded-lg border border-border/20">
                <button
                  type="button"
                  onClick={() => setIsAdmin(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    !isAdmin 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-secondary/30'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Job Seeker</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdmin(true)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isAdmin 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-secondary/30'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-muted-foreground">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                    placeholder="Enter your full name"
                    className="bg-background border-border/20 nvidia-glow"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="Enter your email"
                  className="bg-background border-border/20 nvidia-glow"
                />
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="password" className="text-muted-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    placeholder="Enter your password"
                    className="bg-background border-border/20 nvidia-glow pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full nvidia-glow"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline text-sm"
                >
                  {isLogin 
                    ? 'Need an account? Create one' 
                    : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
