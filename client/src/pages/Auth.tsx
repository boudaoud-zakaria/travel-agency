import { useForm } from "react-hook-form";
import { useLogin } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const [_, setLocation] = useLocation();
  const { mutate: login, isPending } = useLogin();
  const { toast } = useToast();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const onSubmit = (data: any) => {
    login(data, {
      onSuccess: (user) => {
        toast({ title: "Welcome back!", description: `Signed in as ${user.name}` });
        if (user.role === 'EMPLOYEE' || user.role === 'SUPER_ADMIN') {
          setLocation("/admin");
        } else {
          setLocation("/");
        }
      },
      onError: (err) => {
        toast({ 
          title: "Login Failed", 
          description: err.message, 
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">Al-Anwar</h1>
            <p className="text-muted-foreground mt-2">Sign in to your account</p>
          </div>

          <Card className="border-none shadow-none">
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4 px-0">
                <div className="space-y-2">
                  <Label htmlFor="username">Username / Email</Label>
                  <Input 
                    id="username" 
                    placeholder="Enter your username" 
                    {...register("username", { required: true })} 
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    {...register("password", { required: true })}
                    className="h-12" 
                  />
                </div>
              </CardContent>
              <CardFooter className="px-0 flex flex-col space-y-4">
                <Button className="w-full h-12 text-lg" disabled={isPending}>
                  {isPending ? <Loader2 className="animate-spin mr-2" /> : "Sign In"}
                </Button>
                <div className="text-center text-sm">
                  <a href="#" className="text-primary hover:underline">Forgot password?</a>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block relative bg-primary">
        <div className="absolute inset-0 bg-primary/40 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600" 
          alt="Login Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-12 left-12 z-20 text-white max-w-lg">
          <h2 className="text-4xl font-bold mb-4">Your Gateway to Spiritual Journeys</h2>
          <p className="text-lg opacity-90">Manage your bookings, view itineraries, and prepare for your trip with ease.</p>
        </div>
      </div>
    </div>
  );
}
