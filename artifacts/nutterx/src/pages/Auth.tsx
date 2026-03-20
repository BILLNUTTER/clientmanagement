import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin, useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      const res = await loginMutation.mutateAsync({ data });
      login(res.token);
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      
      const isAdminUrl = new URLSearchParams(window.location.search).get("admin") === "true";
      if (isAdminUrl && res.user.role === 'admin') {
        setLocation('/admin');
      } else {
        setLocation('/dashboard');
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Login failed", description: err.message || "Invalid credentials" });
    }
  };

  const onRegister = async (data: z.infer<typeof registerSchema>) => {
    try {
      const res = await registerMutation.mutateAsync({ data });
      login(res.token);
      toast({ title: "Account created!", description: "Welcome to Nutterx." });
      setLocation('/dashboard');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Registration failed", description: err.message || "Something went wrong" });
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-background z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 blur-[120px] rounded-full z-0 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-[1px] mb-6 shadow-xl shadow-blue-500/20">
             <div className="w-full h-full bg-background rounded-[15px] flex items-center justify-center">
                <span className="font-display font-bold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">N</span>
              </div>
          </div>
          <h2 className="text-3xl font-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-muted-foreground mt-2">
            {isLogin ? 'Enter your credentials to access your dashboard' : 'Join us to request premium services'}
          </p>
        </div>

        <div className="flex bg-black/40 p-1 rounded-xl mb-8 border border-white/5">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-white'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-white'}`}
          >
            Register
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              onSubmit={loginForm.handleSubmit(onLogin)}
              className="space-y-4"
            >
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Email address" className="pl-11" {...loginForm.register('email')} />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="password" placeholder="Password" className="pl-11" {...loginForm.register('password')} />
              </div>
              <Button type="submit" variant="gradient" className="w-full mt-6" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={registerForm.handleSubmit(onRegister)}
              className="space-y-4"
            >
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Full Name" className="pl-11" {...registerForm.register('name')} />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Email address" className="pl-11" {...registerForm.register('email')} />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="password" placeholder="Password (min 6 chars)" className="pl-11" {...registerForm.register('password')} />
              </div>
              <Button type="submit" variant="gradient" className="w-full mt-6" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
