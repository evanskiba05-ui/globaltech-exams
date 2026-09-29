import { createFileRoute, Link } from "@tanstack/react-router";
import LeftSideImage from "@/components/left-side-image";
import Button from "@/components/button";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Lock from "@/components/icons/lockIcon";
import ClockIcon from "@/components/icons/clockIcon";
import Logo from "@/components/logo";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="lg:grid grid-cols-2">
      <LeftSideImage />
      <div className="h-screen w-full! bg-primary-450 px-10 flex flex-col justify-center gap-12 items-center">
        {/* logo  */}
        <div className="size-20 animate-bounce">
          <Logo variant="large" />
        </div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{
            duration: 0.8,
            scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
          }}
          className="flex flex-col gap-8 text-center"
        >
          <div className="space-y-4">
            <div className="text-center flex flex-col gap-2">
              <h1 className="text-5xl font-bold  text-amber-50">JAMB CBT</h1>
              <h1
                className="bg-linear-to-r 
           from-[#AD7E04] from-r 
           via-[#FBBF24] via-39% 
           to-[#F6E4B4] to-100%
           bg-clip-text text-transparent text-5xl font-bold"
              >
                Practice
              </h1>
              <h1 className="text-5xl font-bold text-amber-50">Questions</h1>
            </div>
            <div className="flex justify-center items-center flex-col gap-6">
              <p className="text-white text-3xl">By</p>
              <img
                src="/images/GlobaltechR.png"
                alt="logo"
                className="w-3xs h-12"
              />
            </div>
            {/* button  */}
          </div>
          <div className="flex  w-full mx-auto gap-4 mt-5">
            {[
              { icon: Lock, content: "Secure & Encrypted" },
              { icon: ClockIcon, content: "Instant Results" },
            ].map((item) => (
              <Button
                key={item.content}
                variant="tertiary"
                className="border flex gap-1 font-dm-sans text-sm  justify-center items-center py-2 px-5 rounded-full  text-amber-50"
              >
                <item.icon size={24} fill="#fbbf24" />
                {item.content}
              </Button>
            ))}
          </div>
        </motion.div>
        <Link to="/student/login" className=" w-4/5 mt-4 flex justify-center">
          <Button variant="accent"  size="large">
            Access Examination Portal <ArrowRight />{" "}
          </Button>
        </Link>
      </div>
    </div>
  );
}
