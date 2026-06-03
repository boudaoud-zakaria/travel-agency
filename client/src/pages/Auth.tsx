import { useForm } from "react-hook-form";
import { useLogin } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Shield, Mountain, Zap, Compass, Map, ShieldCheck, ArrowRight } from "lucide-react";
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
        toast({ title: "Welcome back, Guide!", description: `Authenticated as ${user.name}` });
        if (user.role === 'SUPER_ADMIN') {
          setLocation("/admin");
        } else if (user.role === 'EMPLOYEE') {
          setLocation("/employee");
        } else {
          setLocation("/");
        }
      },
      onError: (err: any) => {
        toast({
          title: "Access Denied",
          description: err.message || "Invalid expedition credentials",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">

      {/* Left: Form */}
      <div className="flex items-center justify-center px-8 lg:px-20 py-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <a href="/" className="inline-flex items-center gap-4 group">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:scale-105 transition-all">
                <Mountain className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-primary uppercase tracking-tighter leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>Travel Genius</div>
                <div className="text-[10px] font-black tracking-[4px] text-emerald-600 uppercase leading-none mt-1">Adventure HQ</div>
              </div>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-10">
              <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none mb-3">Staff Portal</h1>
              <p className="text-muted-foreground font-medium text-lg">Initialize expedition command link.</p>
            </div>

            {/* Demo credentials hint */}
            <div className="mb-8 p-6 rounded-3xl bg-primary/5 border border-primary/10 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShieldCheck className="w-12 h-12" />
               </div>
              <div className="flex items-start gap-4 relative z-10">
                <Shield className="w-5 h-5 text-primary mt-1 shrink-0" />
                <div className="text-xs text-primary/80 font-medium">
                  <span className="font-black uppercase tracking-widest text-[10px]">Demo Protocol:</span><br />
                  <div className="mt-2 space-y-1">
                    <div>Admin: <span className="font-black text-primary">admin@travelgenius.dz</span></div>
                    <div>Pass: <span className="font-black text-primary">Admin@123456</span></div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Staff Identifier (Email)</Label>
                <div className="relative group">
                  <Input
                    id="username"
                    type="email"
                    placeholder="name@travelgenius.dz"
                    {...register("username", {
                      required: "Staff email is required",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Valid communication link required" }
                    })}
                    className={`h-14 px-5 rounded-2xl text-sm font-bold border-border/50 bg-muted/20 focus-visible:ring-primary/10 ${errors.username ? 'border-destructive' : 'group-hover:border-primary/30'}`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <Zap className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
                {errors.username && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-destructive ml-1">{errors.username.message as string}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Encryption Key (Pass)</Label>
                  <a href="#" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-emerald-600 transition-colors">Reset Key</a>
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password", { required: "Key is required" })}
                    className={`h-14 px-5 rounded-2xl text-sm font-bold pr-14 border-border/50 bg-muted/20 focus-visible:ring-primary/10 ${errors.password ? 'border-destructive' : 'group-hover:border-primary/30'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-destructive ml-1">{errors.password.message as string}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-16 text-xs font-black uppercase tracking-[0.2em] bg-primary text-white hover:bg-primary/95 shadow-2xl shadow-primary/20 border-0 rounded-2xl transition-all active:scale-95 group"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-3 h-5 w-5" />
                    Authenticating...
                  </>
                ) : (
                  <span className="flex items-center">
                    Enter Headquarters <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-12 pt-8 border-t border-border/50 text-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Off-Duty Alpinist? </span>
              <a href="/" className="text-xs font-black text-primary uppercase tracking-widest hover:text-emerald-600 ml-2 border-b-2 border-primary/20 pb-0.5 transition-colors">
                Return to Surface
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden lg:relative lg:flex items-end bg-[#0B0D11] overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
          src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&auto=format&fit=crop&q=80"
          alt="Expedition HQ"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-emerald-950 opacity-90" />
        
        {/* Topographic Lines Decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-none stroke-current stroke-[0.1]">
              <path d="M0 20 Q30 40 60 20 T100 30" />
              <path d="M0 40 Q30 60 60 40 T100 50" />
              <path d="M0 60 Q30 80 60 60 T100 70" />
           </svg>
        </div>

        {/* Floating status cards */}
        <div className="absolute top-1/4 left-12 right-12 space-y-6 z-20">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-3xl"
          >
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.8)]"></div>
                  <span className="text-white font-black text-[10px] tracking-[4px] uppercase">HQ Real-Time Status</span>
               </div>
               <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">Basecamp-01</div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              {[
                { label: "Active Expeditions", value: "24", icon: Mountain },
                { label: "Operational Fleet", value: "14", icon: Map },
                { label: "Guides On-Duty", value: "38", icon: ShieldCheck },
                { label: "Revenue Delta", value: "+12.4%", icon: Zap },
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2 text-white/40 mb-1">
                     <stat.icon className="w-3.5 h-3.5" />
                     <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <div className="text-white font-black text-3xl tracking-tighter">{stat.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="bg-emerald-500/10 backdrop-blur-xl rounded-3xl p-6 border border-emerald-500/20 flex items-center justify-between"
          >
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20">
                   <Compass className="animate-spin-slow w-6 h-6" />
                </div>
                <div>
                   <div className="text-white font-black text-xs uppercase tracking-widest">GPS Uplink Active</div>
                   <div className="text-emerald-400 text-[10px] font-bold">Secure connection established.</div>
                </div>
             </div>
             <div className="bg-emerald-500/20 px-3 py-1 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest">Standby</div>
          </motion.div>
        </div>

        <div className="relative z-10 p-16 pb-20 text-white w-full">
          <div className="mb-6 flex items-center gap-3">
             <span className="h-px w-10 bg-emerald-500" />
             <span className="text-[10px] font-black uppercase tracking-[5px] text-emerald-500">OPERATIONAL ACCESS</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter uppercase leading-none">
            Travel Genius<br />Expedition HQ
          </h2>
          <p className="text-white/50 max-w-sm leading-relaxed text-sm font-medium">
            Command and control center for high-altitude trekking operations and Sahara logistics across North Africa.
          </p>
          <div className="flex gap-4 mt-10">
            {["🏔️ Alpine", "🏜️ Sahara", "🌲 Forest", "⛺ Wild"].map((tag) => (
              <span key={tag} className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-white/70 border border-white/10 uppercase tracking-widest">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
