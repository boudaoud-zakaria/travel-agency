import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSubmitCustomRequest } from "@/hooks/use-custom-requests";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Loader2, CheckCircle2, Mountain, MapPin, Calendar, Users,
  DollarSign, MessageSquare, Phone, Mail, User, Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ACTIVITY_TYPES = [
  { value: "alpine", label: "🏔️ Mountain & Alpine" },
  { value: "desert", label: "🏜️ Sahara Desert" },
  { value: "cultural", label: "🏛️ Cultural & Heritage" },
  { value: "coastal", label: "🌊 Coastal & Beach" },
  { value: "religious", label: "🕌 Religious (Hajj / Umrah)" },
  { value: "custom", label: "✨ Fully Custom" },
];

const BUDGET_OPTIONS = [
  { value: "under_50k", label: "< 50,000 DZD / person" },
  { value: "50k_150k", label: "50,000 – 150,000 DZD" },
  { value: "150k_350k", label: "150,000 – 350,000 DZD" },
  { value: "350k_plus", label: "> 350,000 DZD (premium)" },
  { value: "flexible", label: "Flexible / Open to proposals" },
];

interface FormValues {
  name: string;
  email: string;
  phone: string;
  destination: string;
  dateFrom: string;
  dateTo: string;
  groupSize: number;
  budget: string;
  activityType: string;
  requirements: string;
  message: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CustomRequestForm({ open, onClose }: Props) {
  const { mutate: submit, isPending } = useSubmitCustomRequest();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { groupSize: 2, activityType: "alpine" },
  });

  const activityType = watch("activityType");
  const budget = watch("budget");

  const onSubmit = (data: FormValues) => {
    submit(
      { ...data, groupSize: Number(data.groupSize) },
      {
        onSuccess: () => {
          setSubmitted(true);
          reset();
        },
        onError: (err: any) => {
          toast({
            title: "Submission failed",
            description: err.message || "Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-primary px-8 pt-8 pb-6">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-white">Custom Expedition</DialogTitle>
                <DialogDescription className="text-white/60 text-sm">
                  Tell us your dream adventure — we'll craft it for you.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-3">Request Sent!</h3>
                <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                  Our team will review your request and reach out within <strong>24–48 hours</strong> with a personalised proposal.
                </p>
                <Button onClick={handleClose} className="mt-8 bg-primary text-white rounded-xl px-8">
                  Close
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Personal Info */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Contact Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Full Name *</Label>
                      <Input
                        placeholder="Ahmed Benali"
                        {...register("name", { required: "Required" })}
                        className={`rounded-xl ${errors.name ? "border-destructive" : ""}`}
                      />
                      {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Email *</Label>
                      <Input
                        type="email"
                        placeholder="you@email.com"
                        {...register("email", { required: "Required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } })}
                        className={`rounded-xl ${errors.email ? "border-destructive" : ""}`}
                      />
                      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Phone *</Label>
                      <Input
                        placeholder="05XX XXX XXX"
                        {...register("phone", { required: "Required" })}
                        className={`rounded-xl ${errors.phone ? "border-destructive" : ""}`}
                      />
                      {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <Mountain className="w-3.5 h-3.5" /> Trip Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold">Desired Destination *</Label>
                      <Input
                        placeholder="e.g. Tassili N'Ajjer, Hoggar, Djurdjura..."
                        {...register("destination", { required: "Required" })}
                        className={`rounded-xl ${errors.destination ? "border-destructive" : ""}`}
                      />
                      {errors.destination && <p className="text-xs text-destructive">{errors.destination.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Activity Type *</Label>
                      <Select value={activityType} onValueChange={(v) => setValue("activityType", v)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTIVITY_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Group Size *</Label>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        placeholder="Number of travellers"
                        {...register("groupSize", { required: "Required", min: 1 })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Departure From *</Label>
                      <Input
                        type="date"
                        {...register("dateFrom", { required: "Required" })}
                        className={`rounded-xl ${errors.dateFrom ? "border-destructive" : ""}`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Return By *</Label>
                      <Input
                        type="date"
                        {...register("dateTo", { required: "Required" })}
                        className={`rounded-xl ${errors.dateTo ? "border-destructive" : ""}`}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold">Budget Range</Label>
                      <Select value={budget} onValueChange={(v) => setValue("budget", v)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select your budget range (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUDGET_OPTIONS.map((b) => (
                            <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Additional Details
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Special Requirements</Label>
                      <Textarea
                        placeholder="Dietary needs, physical conditions, equipment preferences, accessibility needs..."
                        rows={2}
                        {...register("requirements")}
                        className="rounded-xl resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Tell us more about your dream expedition *</Label>
                      <Textarea
                        placeholder="Describe your ideal adventure, what you're looking for, what inspires you about this trip..."
                        rows={4}
                        {...register("message", { required: "Please tell us about your dream expedition" })}
                        className={`rounded-xl resize-none ${errors.message ? "border-destructive" : ""}`}
                      />
                      {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-13 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  {isPending ? (
                    <><Loader2 className="animate-spin mr-2 w-4 h-4" /> Sending your request…</>
                  ) : (
                    "Send My Expedition Request →"
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
