import PWAInstallButton from "@/components/PWAInstallButton";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import * as motion from "motion/react-client";
import Image from "next/image";
import { MobileMenu } from "./MobileMenu";

export const Header = () => {
  return (
    <header className="mx-auto min-h-16 pt-4 max-w-7xl px-3  md:px-12">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center">
          <a href="/home" className="flex items-center">
            <div className="relative h-6 w-6">
              <Image src={"/icon.png"} alt="Logo" fill sizes="24px" priority />
            </div>
            <div className="-mr-16">
              <h1 className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-2xl font-bold text-transparent inline">
                PsxWorth
                <span className="text-sm bg-inherit bg-clip-text text-transparent">.com</span>
              </h1>
            </div>
          </a>
        </div>
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li>
              <a href="/portfolio" className="transition-colors hover:text-purple-400">
                Portfolio
              </a>
            </li>
            <li>
              <a href="/faqs" className="transition-colors hover:text-purple-400">
                FAQs
              </a>
            </li>
            <li>
              <a href="/contact" className="transition-colors hover:text-purple-400">
                Contact
              </a>
            </li>
          </ul>
        </nav>
        <div className="flex gap-1 items-center">
          <PWAInstallButton />
          <div className="flex justify-center items-center w-14 h-12">
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>{" "}
          </div>
          <MobileMenu />
        </div>
      </motion.div>
    </header>
  );
};
