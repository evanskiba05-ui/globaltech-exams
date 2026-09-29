import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, ArrowLeft, CheckCircle2, Mailbox } from "lucide-react";
import { ResetPasswordSchema } from "@/lib/schema";
import Button from "@/components/button";

export const Route = createFileRoute("/admin/reset-password")({
  component: ResetPasswordRoute,
});

function ResetPasswordRoute() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-450 p-4 font-dm-sans">
      <div className="w-full max-w-xl bg-primary-100/50 backdrop-blur-md rounded-[40px] shadow-sm overflow-hidden">
         <ResetPasswordForm onSuccess={() => navigate({ to: "/admin/login" })} onBack={() => navigate({ to: "/admin/login" })} />
      </div>
    </div>
  );
}

interface ResetPasswordFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

import { forgotAdminPassword } from "@/lib/api";
import CustomInput from "@/components/input";
import { useAlertStore } from "@/store/alert";

export function ResetPasswordForm({ onSuccess, onBack }: ResetPasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showAlert } = useAlertStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof ResetPasswordSchema>) => {
    setLoading(true);
    try {
      await forgotAdminPassword(data.email);
      setSent(true);
      showAlert({ message: "Password reset link sent to your email", type: "success" });
    } catch (error: any) {
      const message = error.response?.data?.detail || "Failed to send reset link. Please check your email.";
      showAlert({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col h-full">
         <div className="bg-primary-450 text-white py-10 px-8 flex flex-col items-center">
          <h2 className="text-4xl font-semibold mb-2">Reset Password</h2>
          <p className="text-white/80 text-sm">Follow the link in your email</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="size-10 bg-green-500 rounded-full flex items-center justify-center text-white"
          >
            <img src="/icons/check.png" className="size-4" />
          </motion.div>
          <div className="space-y-2 pb-15">
            <h3 className="text-3xl font-bold text-success-500">Reset Link Sent!</h3>
            <p className="text-neutral-500 max-w-sm">Check your email for the password reset link.</p>
          </div>
          {/* <Button
            variant="secondary"
            className="w-full h-18 text-xl  rounded-2xl bg-secondary-700 hover:bg-secondary-600 mt-4"
            onClick={onSuccess}
          >
            Return to Login
          </Button> */}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="bg-primary-450 text-white py-10 px-8 flex flex-col items-center">
        <h2 className="text-4xl font-semibold mb-2">Reset Password</h2>
        <p className="text-white/80 text-sm">Enter your email to receive a reset link</p>
      </div>

      {/* Form Section */}
      <div className="p-12 space-y-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <CustomInput
                  {...field}
                  label="Admin Email Address"
                  placeholder="Enter your email"
                  type="email"
                  prefixIcon={<img src="/icons/mail.png" alt="email" />}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>
                )}
              </div>
            )}
          />

          {/* Actions */}
          <div className="space-y-4">
            <Button
              variant="secondary"
              size="large"
              className="w-full h-18 text-xl rounded-2xl shadow-xl bg-secondary-700 hover:bg-secondary-600"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  Processing<span className="animate-pulse">...</span>
                </span>
              ) : "Send Reset Link"}
            </Button>

            <button
              type="button"
              onClick={onBack}
              className="w-full h-18 text-xl rounded-2xl border-2 border-primary-500 text-primary-500 font-semibold flex items-center justify-center gap-3 hover:bg-primary-50 transition-colors cursor-pointer"
            >
              <ArrowLeft size={24} /> Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
