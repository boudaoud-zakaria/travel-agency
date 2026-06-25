import { useForm } from "react-hook-form";
import { useLogin } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, ArrowRight, Mountain, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Auth() {
  const [_, setLocation] = useLocation();
  const { mutate: login, isPending } = useLogin();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { username: "", password: "" }
  });

  const onSubmit = (data: any) => {
    login(data, {
      onSuccess: (user: any) => {
        toast({ title: "Welcome back!", description: `Signed in as ${user.name}` });
        if (user.role === "SUPER_ADMIN") {
          setLocation("/admin");
        } else if (user.role === "EMPLOYEE") {
          setLocation("/employee");
        } else {
          setLocation("/");
        }
      },
      onError: (err: any) => {
        toast({
          title: "Sign-in failed",
          description: err.message || "Invalid email or password.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* ── Left panel: form ── */}
      <div className="flex flex-col justify-center w-full max-w-md mx-auto px-8 py-16 lg:mx-0 lg:px-16">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <a href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              <Mountain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-black text-primary tracking-tight leading-none">Tehwissa 213</div>
              <div className="text-[10px] font-bold tracking-[3px] text-muted-foreground uppercase mt-0.5">Staff Portal</div>
            </div>
          </a>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">Sign in</h1>
          <p className="text-muted-foreground text-sm">Access the admin and operations dashboard.</p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm font-semibold text-foreground">
              Email address
            </Label>
            <Input
              id="username"
              type="email"
              placeholder="you@tehwissa213.dz"
              autoComplete="email"
              {...register("username", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
              })}
              className={`h-12 rounded-xl border-border/60 bg-muted/30 text-sm font-medium focus-visible:ring-primary/20 ${
                errors.username ? "border-destructive focus-visible:ring-destructive/20" : ""
              }`}
            />
            {errors.username && (
              <p className="text-xs text-destructive font-medium">{errors.username.message as string}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password
              </Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password", { required: "Password is required" })}
                className={`h-12 rounded-xl border-border/60 bg-muted/30 text-sm font-medium pr-12 focus-visible:ring-primary/20 ${
                  errors.password ? "border-destructive focus-visible:ring-destructive/20" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive font-medium">{errors.password.message as string}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-2 group"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Signing in…
              </>
            ) : (
              <span className="flex items-center gap-2">
                Sign in
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            )}
          </Button>
        </motion.form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 pt-8 border-t border-border/40 text-center"
        >
          <a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
            ← Back to website
          </a>
        </motion.div>
      </div>

      {/* ── Right panel: visual ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#0b0e14]">
        {/* Background image */}
        <motion.img
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, repeat: Infinity, repeatType: "mirror" }}
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&auto=format&fit=crop&q=80"
          alt="Algerian mountains"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-emerald-900/90" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end p-16 pb-20 text-white w-full">
          {/* Destination tags */}
          <div className="flex flex-wrap gap-2 mb-10">
            {[
              { icon: "🏔️", label: "Djurdjura" },
              { icon: "🏜️", label: "Tassili N'Ajjer" },
              { icon: "🌊", label: "El Kala" },
              { icon: "🕌", label: "Timgad" },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/15"
              >
                {icon} {label}
              </span>
            ))}
          </div>

          <h2 className="text-5xl font-black tracking-tight leading-[1.05] mb-5">
            Explore Algeria<br />with Tehwissa 213
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs font-medium mb-8">
            Curated expeditions across the Sahara, mountains and ancient ruins of Algeria — trusted by thousands since 2009.
          </p>

          {/* Stats row */}
          <div className="flex gap-8">
            {[
              { value: "12K+", label: "Adventurers" },
              { value: "8", label: "Destinations" },
              { value: "15+", label: "Years" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-black">{value}</div>
                <div className="text-xs text-white/50 font-semibold uppercase tracking-wider mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Bottom badge */}
          <div className="absolute bottom-8 right-8 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/15">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-xs font-bold text-white">Algiers HQ</div>
              <div className="text-[10px] text-white/50 font-medium">hq@tehwissa213.dz</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
