import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import logoPath from "@assets/Neon-Riverboat-Logo.png";

export default function AuthPage() {
  const { login, register, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", password: "" });

  if (isAuthenticated) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img src={logoPath} alt="Lucky Riverboat" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="font-display text-2xl gold-text" data-testid="auth-title">Welcome Aboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to start playing</p>
        </div>

        <div className="glass-panel rounded-xl p-6 gold-glow">
          <Tabs defaultValue="login">
            <TabsList className="w-full bg-muted/50 mb-6">
              <TabsTrigger value="login" className="w-1/2" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" className="w-1/2" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  login.mutate(loginForm, { onSuccess: () => setLocation("/") });
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    placeholder="demo"
                    data-testid="input-login-username"
                    className="bg-muted/50 border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="demo123"
                    data-testid="input-login-password"
                    className="bg-muted/50 border-border"
                  />
                </div>
                {login.isError && (
                  <p className="text-destructive text-sm" data-testid="login-error">
                    {(login.error as Error).message}
                  </p>
                )}
                <Button type="submit" className="w-full btn-casino" disabled={login.isPending} data-testid="btn-login">
                  {login.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Login
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Demo: demo / demo123 &bull; Admin: admin / admin123
                </p>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  register.mutate(registerForm, { onSuccess: () => setLocation("/") });
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="reg-username">Choose Username</Label>
                  <Input
                    id="reg-username"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    data-testid="input-register-username"
                    className="bg-muted/50 border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-password">Choose Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    data-testid="input-register-password"
                    className="bg-muted/50 border-border"
                  />
                </div>
                {register.isError && (
                  <p className="text-destructive text-sm" data-testid="register-error">
                    {(register.error as Error).message}
                  </p>
                )}
                <Button type="submit" className="w-full btn-casino" disabled={register.isPending} data-testid="btn-register">
                  {register.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  New accounts get $1,000 USDT demo balance
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}
