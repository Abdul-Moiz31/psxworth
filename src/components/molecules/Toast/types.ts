export type ToastType = "success" | "error" | "info" | "warning" | "loading";

export interface ToastProps {
  id: string | number;
  title: string;
  description?: string;
  type?: "success" | "error" | "info" | "loading";
  duration?: number;
  button?: {
    label?: string;
    onClick?: () => void;
  };
}

export interface ToastConfig {
  icon: React.ComponentType<{ className?: string }>;
  bgGradient: string;
  borderColor: string;
  shadowColor: string;
  iconGradient: string;
  textColor: string;
  progressGradient: string;
  animate?: boolean;
}
