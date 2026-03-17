import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, CheckCircle2, Shield, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid work email").max(255),
  company: z.string().min(2, "Company name is required").max(100),
  role: z.string().min(1, "Please select your role"),
  topic: z.string().min(1, "Please select a topic"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

type ContactFormData = z.infer<typeof contactSchema>;

const roles = [
  { value: "ciso", label: "CISO" },
  { value: "it-ops", label: "IT / Ops" },
  { value: "founder", label: "Founder" },
  { value: "analyst", label: "Analyst" },
  { value: "other", label: "Other" },
];

const topics = [
  { value: "monitoring", label: "Monitoring" },
  { value: "assessment", label: "Assessment" },
  { value: "incident", label: "Incident Support" },
  { value: "advisory", label: "Advisory" },
  { value: "other", label: "Other" },
];

export default function Contact() {
  const [formData, setFormData] = useState<Partial<ContactFormData>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const { toast } = useToast();

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (honeypot) {
      return;
    }

    try {
      const validatedData = contactSchema.parse(formData);
      setErrors({});
      setIsSubmitting(true);

      const { error } = await supabase.functions.invoke("contact-form", {
        body: validatedData,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to send",
          description: "Please try again or contact us directly.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center max-w-md px-4">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Message Received!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for reaching out. Our team will review your inquiry and respond within 24 hours.
            </p>
            <Button variant="hero" onClick={() => setIsSuccess(false)}>
              Send Another Message
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Form Section */}
              <div className="lg:col-span-3">
                <h1 className="text-4xl font-bold text-foreground mb-4">Get in Touch</h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Ready to strengthen your security posture? Tell us about your needs.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot - hidden from users */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="John Smith"
                        value={formData.fullName || ""}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        className={errors.fullName ? "border-destructive" : ""}
                      />
                      {errors.fullName && (
                        <p className="text-xs text-destructive">{errors.fullName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Work Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        value={formData.email || ""}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        placeholder="Acme Corp"
                        value={formData.company || ""}
                        onChange={(e) => handleChange("company", e.target.value)}
                        className={errors.company ? "border-destructive" : ""}
                      />
                      {errors.company && (
                        <p className="text-xs text-destructive">{errors.company}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Your Role *</Label>
                      <Select
                        value={formData.role || ""}
                        onValueChange={(value) => handleChange("role", value)}
                      >
                        <SelectTrigger className={errors.role ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.role && (
                        <p className="text-xs text-destructive">{errors.role}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic *</Label>
                    <Select
                      value={formData.topic || ""}
                      onValueChange={(value) => handleChange("topic", value)}
                    >
                      <SelectTrigger className={errors.topic ? "border-destructive" : ""}>
                        <SelectValue placeholder="What can we help with?" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic.value} value={topic.value}>
                            {topic.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.topic && (
                      <p className="text-xs text-destructive">{errors.topic}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your security needs..."
                      rows={5}
                      value={formData.message || ""}
                      onChange={(e) => handleChange("message", e.target.value)}
                      className={errors.message ? "border-destructive" : ""}
                    />
                    {errors.message && (
                      <p className="text-xs text-destructive">{errors.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Why GEM?</h3>
                  <div className="space-y-4">
                    {[
                      { icon: Shield, label: "Enterprise-Grade Security", desc: "SOC 2 & ISO 27001 certified" },
                      { icon: Clock, label: "Rapid Response", desc: "< 15 minute incident response" },
                      { icon: Users, label: "Expert Team", desc: "Dedicated security professionals" },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div key={label} className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{label}</h4>
                          <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Need immediate help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    For urgent security incidents, contact our SOC team directly.
                  </p>
                  <p className="text-sm font-mono text-primary">soc@gem-cyber.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
