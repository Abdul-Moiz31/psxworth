import { Card } from "@/components/ui/card";
import AnimatedIcon from "./AnimatedIcon";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string; // e.g. "from-blue-500 to-indigo-600"
  iconAnimation?: import("motion/react").Variants;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, gradient, iconAnimation }) => {
  return (
    <div className="group h-full">
      <Card className="relative flex h-full flex-col overflow-hidden border border-white/10 p-8 transition-all duration-300">
        <div className="relative flex-1">
          <AnimatedIcon path={icon} gradient={gradient} size={22} animation={iconAnimation} />

          <div className="relative z-10">
            <div className={`mb-3 h-0.5 w-1/3 bg-gradient-to-r ${gradient}`} />

            <h3 className="mb-3 text-xl font-bold text-gray-100">{title}</h3>

            <p className="text-slate-300 opacity-80">{description}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
