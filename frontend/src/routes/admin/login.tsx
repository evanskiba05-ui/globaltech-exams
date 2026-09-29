import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, X } from "lucide-react";
import { AdminLogInSchema, ResetPasswordSchema } from "@/lib/schema";
import Button from "@/components/button";
import GradutionCapIcon from "@/components/icons/graduation-cap";
import { Modal } from "@/components/modal-shell";
import { ResetPasswordForm } from "./reset-password";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

import CustomInput from "@/components/input";
import { useAdminAuthStore } from "@/store/admin-auth";
import { useAlertStore } from "@/store/alert";
import Logo from "@/components/logo";

function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [resetPwdCfg, setResetPwdCfg] = useState({});
  const openResetPwd = (cfg: any) => { setResetPwdCfg(cfg); setResetPwdOpen(true); };
  const closeResetPwd = () => setResetPwdOpen(false);
  const { adminLoginAction } = useAdminAuthStore();
  const { showAlert } = useAlertStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof AdminLogInSchema>>({
    resolver: zodResolver(AdminLogInSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof AdminLogInSchema>) => {
    setLoading(true);
    try {
      await adminLoginAction(data);
      showAlert({message:"Login successful! Welcome to the Admin Portal.",type:"success"});
      navigate({ to: "/admin/dashboard" });
    } catch (error: any) {
      const message = error.response?.data?.detail || "Invalid credentials. Please try again.";
      showAlert({type:"error", message});
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResetModal = (e: React.MouseEvent) => {
    e.preventDefault();
    openResetPwd({
      content: <ResetPasswordForm onSuccess={closeResetPwd} onBack={closeResetPwd} />,
      size: "lg",
      showCloseButton: false,
      noPadding: true,
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-dm-sans bg-neutral-100">
      {/* Header Section */}
      <div className="relative h-64">
        <img  src="/images/LEFT SIDE IMAGE 1.png" alt="" className="size-full object-cover object-top-right "/>
      <div className=" text-white bg-primary-450/50 p-8  absolute top-0 right-0 left-0 flex flex-col   overflow-hidden">
        {/* Logo and Platform Name */}
        <div className="items-center w-80 mt-5 space-y-5 gap-3">
          <div className="flex flex-col">
            <img src="/images/GlobaltechR.png" alt="Globaltech Logo" />
          </div>
        <div className="flex items-center space-x-5">
          <div className="size-8">
          <Logo variant="small" />
        </div>
        <p>CBT Examination Platform</p>
        </div>
        </div>

        {/* Title */}
        <div className="mt-2 text-center z-10">
          <h1 className="text-4xl font-semibold mb-2">Admin Portal</h1>
          <p className="text-white/60 text-sm">Restricted access – Authorized personnel only</p>
        </div>
        
        {/* Decorative elements or background overlay if needed */}
        <div className="absolute inset-0 bg-blue-900/10 pointer-events-none"></div>
      </div>

      </div>

      {/* Form Section */}
      <div className="flex-1 flex justify-center py-12 px-4 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Controller
              name="emailOrUsername"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <CustomInput
                    {...field}
                    label="Admin Username or Email"
                    placeholder="Enter username or email"
                    prefixIcon={<img src="/icons/user.png" className="size-5" />}
                  />
                  {errors.emailOrUsername && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.emailOrUsername.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <CustomInput
                    {...field}
                    label="Password"
                    placeholder="Enter password"
                    type={showPassword ? "text" : "password"}
                    prefixIcon={<img src="/icons/noto_locked-with-key.png" className="size-5" />}
                    icon={true}
                    visible={showPassword}
                    setIsvisible={setShowPassword}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>
                  )}
                </div>
              )}
            />

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Controller
                  name="rememberMe"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <input
                      {...field}
                      type="checkbox"
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                      id="rememberMe"
                      className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                  )}
                />
                <label htmlFor="rememberMe" className="text-neutral-500 font-medium text-sm cursor-pointer">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={handleOpenResetModal}
                className="text-primary-500 font-semibold text-sm hover:underline cursor-pointer"
              >
                Forget Password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-center">
              <Button
                variant="primary"
                size="large"
                className="w-full h-16 text-xl rounded-2xl shadow-lg"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                   <span className="flex items-center gap-3">
                     Verifying<span className="animate-pulse">......</span>
                   </span>
                ) : (
                  "Sign in to Admin Portal"
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Reset Password Modal */}
      <Modal 
        isOpen={resetPwdOpen} 
        onClose={closeResetPwd} 
        {...resetPwdCfg} 
      />
    </div>
  );
}

