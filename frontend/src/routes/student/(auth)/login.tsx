import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ArrowRight } from "lucide-react";
import NoticeCard from "./-components/notice-card";

import { useState } from "react";
import { motion } from "motion/react";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/button";
import ErrorIcon from "@/components/icons/error";
import CustomPhoneIcon from "@/components/icons/phone-icon";
import CustomInput from "@/components/input";
import LeftSideImage from "@/components/left-side-image";
import type { LogInData } from "@/lib/d-types";
import { LogInSchema } from "@/lib/schema";
import { useAuth } from "@/hooks/useAuth";
import { useAlertStore } from "@/store/alert";

export const Route = createFileRoute("/student/(auth)/login")({
  component: Home,
});

function Home() {
  const { loginAction } = useAuth();
  const navigate = useNavigate();
  const [visible, setIsVisible] = useState(false);
   const { showAlert } = useAlertStore();
  const [loading, setLoading] = useState(false);

  const handleFormSubit = async (data: z.infer<typeof LogInSchema>) => {
    setLoading(true);
    try {
      await loginAction(data);
      navigate({ to: "/student/select-subject" });
    } catch (error) {
      console.error("Login failed", error);
      showAlert({ type: "error", message: "Invalid Exam ID or Password" });
    } finally {
      setLoading(false);
    }
  };
  /* Old handleFormSubit:
  const handleFormSubit = (data: z.infer<LogInData>) => {
    console.log("form submitted", data);
    navigate({ to: "/student/select-subject" });
  };
  */

  const form = useForm<z.infer<typeof LogInSchema>>({
    resolver: zodResolver(LogInSchema),
    defaultValues: {
      examId: "",
      password: "",
    },
  });

  return (
    <div className="flex font-dm-sans h-full overflow-hidden ">
      <div className="lg:w-[40%]">
        <LeftSideImage />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.8,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        }}
        className="flex items-center  h-screen flex-1  justify-center max-sm:px-4"
      >
        {/* content  */}
        <div className="space-y-7">
          {/* login title  */}
          <div className="space-y-7">
            <div className="space-y-5">
              <h1 className="font-dm-sans text-4xl font-bold text-primary-500">
                Student Login
              </h1>
              <div className="h-1.5 w-20 bg-accent-500 rounded-3xl" />
            </div>
            <p className="text-neutral-600 text-xl">
              Enter your credentials to begin your examination
            </p>
          </div>

          {/* form credential  */}
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleFormSubit)}
          >
            <div className="space-y-4">
              <Controller
                control={form.control}
                name="examId"
                render={({ field }) => (
                  <div className="relative">
                    <CustomInput
                      label="EXAM ID / USERNAME"
                      placeholder="Enter your EXAM ID / USERNAME"
                      type="text"
                      autoComplete="username"
                      error={form.formState.errors.examId?.message}
                      className=""
                      {...field}
                    />
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="password"
                render={({ field }) => (
                  <div className="relative">
                    <CustomInput
                      label="PASSWORD"
                      placeholder="Enter your PASSWORD"
                      type={visible ? "text" : "password"}
                      icon={true}
                      visible={visible}
                      autoComplete="current-password"
                      error={form.formState.errors.password?.message}
                      setIsvisible={setIsVisible}
                      {...field}
                    />
                  </div>
                )}
              />
            </div>

            <NoticeCard
              icon={<ErrorIcon />}
              iconColor="text-[#3a6499]"
              className="bg-primary-400/20 text-primary-400 font-regular gap-2 text-sm font-dm-sans"
              notice="Login credentials are povider by your administrator."
            />

            <Button
              variant="secondary"
              className="w-full h-16 mt-8 text-[24px]"
              type="submit"
              size="large"
              disabled={!form.formState.isValid || loading}
            >
              {loading ? "Authenticating..." : "Access Examination Portal"} <ArrowRight />
            </Button>
            <NoticeCard
              icon={<CustomPhoneIcon />}
              iconColor="text-black"
              className=" text-neutral-600 font-regular gap-2 text-sm font-dm-sans"
              notice="Having trouble? Contact your exam supervisor"
            />
          </form>
        </div>
      </motion.div>
    </div>
  );
}
