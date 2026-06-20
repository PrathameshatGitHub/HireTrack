"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (signUpError) throw signUpError;
        
        if (data.user && data.session === null) {
          setMessage("Verification email sent! Please check your inbox to confirm your account.");
        } else {
          router.push("/");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background blobs for premium look */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[100px]" />

      <Card className="w-full max-w-md border-border/60 shadow-elevated bg-card/60 backdrop-blur-lg relative z-10 animate-fade-up">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center shadow-md mb-2">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {isSignUp ? "Create an Account" : "Welcome back to Career OS"}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {isSignUp
              ? "Sign up to start organizing and managing your job search pipeline"
              : "Sign in to access your personal Career OS dashboard"}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex gap-2.5 p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 items-start">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-semibold text-red-500 leading-tight">Error</h5>
                  <p className="text-[11px] text-red-400 mt-1 leading-normal">{error}</p>
                </div>
              </div>
            )}

            {message && (
              <div className="flex gap-2.5 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 items-start">
                <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-semibold text-emerald-500 leading-tight">Success</h5>
                  <p className="text-[11px] text-emerald-400 mt-1 leading-normal">{message}</p>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 rounded-xl bg-muted/50 border-transparent focus:bg-background text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" /> Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 rounded-xl bg-muted/50 border-transparent focus:bg-background text-sm"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-4 pb-6">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl gradient-brand text-white text-sm font-semibold hover:shadow-md transition-all border-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSignUp ? (
                "Sign Up"
              ) : (
                "Sign In"
              )}
            </Button>

            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors mt-2"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
