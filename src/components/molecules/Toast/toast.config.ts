import { CheckCircle, AlertCircle, Info, Sparkles } from "lucide-react";
import { ToastConfig } from "./types";

export const toastConfig: Record<"success" | "error" | "info" | "loading", ToastConfig> = {
  success: {
    icon: CheckCircle,
    bgGradient: "bg-green-500",
    borderColor: "border-green-500/30",
    shadowColor: "shadow-green-500/20",
    iconGradient: "text-gray-100",
    textColor: "text-gray-100",
    progressGradient: "bg-green-500",
    animate: false,
  },
  error: {
    icon: AlertCircle,
    bgGradient: "bg-red-500",
    borderColor: "border-red-500/30",
    shadowColor: "shadow-red-500/20",
    iconGradient: "text-gray-100",
    textColor: "text-gray-100",
    progressGradient: "bg-red-500",
    animate: true,
  },
  info: {
    icon: Info,
    bgGradient: "bg-blue-500",
    borderColor: "border-blue-500/30",
    shadowColor: "shadow-blue-500/20",
    iconGradient: "text-gray-100",
    textColor: "text-gray-100",
    progressGradient: "bg-blue-500",
    animate: false,
  },
  loading: {
    icon: Sparkles,
    bgGradient: "bg-purple-500",
    borderColor: "border-purple-500/30",
    shadowColor: "shadow-purple-500/20",
    iconGradient: "text-gray-100",
    textColor: "text-gray-100",
    progressGradient: "bg-purple-500",
    animate: true,
  },
};
