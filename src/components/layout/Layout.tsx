import { Footer } from "./Footer/Footer";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-gray-100">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};
