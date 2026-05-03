import { cn } from "@/lib/utils";
import { GitHubIcon, LinkedInIcon, RedditIcon, TwitterIcon, WhatsAppIcon } from "../../icons";

const socialLinks = [
  {
    name: "WhatsApp",
    href: "https://chat.whatsapp.com/EOsSVPgaTlILo8jSxAhKjb",
    Icon: WhatsAppIcon,
    accentClass:
      "hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:text-emerald-300 focus-visible:ring-emerald-400",
  },
  {
    name: "Reddit",
    href: "https://www.reddit.com/r/psxworth",
    Icon: RedditIcon,
    accentClass:
      "hover:border-orange-500/60 hover:bg-orange-500/10 hover:text-orange-300 focus-visible:ring-orange-400",
  },
  {
    name: "Twitter",
    href: "https://x.com/psxworth",
    Icon: TwitterIcon,
    accentClass: "hover:border-sky-500/60 hover:bg-sky-500/10 hover:text-sky-300 focus-visible:ring-sky-400",
  },
  {
    name: "GitHub",
    href: "https://github.com/Wajahat43",
    Icon: GitHubIcon,
    accentClass: "hover:border-slate-300/70 hover:bg-slate-300/10 hover:text-slate-100 focus-visible:ring-slate-200",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/psxworth",
    Icon: LinkedInIcon,
    accentClass: "hover:border-blue-500/60 hover:bg-blue-500/10 hover:text-blue-300 focus-visible:ring-blue-400",
  },
];

const SocialLinks = () => {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-4 md:mt-0 md:gap-6">
      {socialLinks.map(({ name, href, Icon, accentClass }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group relative flex h-16 w-16 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/70 text-slate-300 shadow-[0_8px_24px_rgba(15,23,42,0.35)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(94,234,212,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
            accentClass
          )}
          aria-label={name}
        >
          <span className="sr-only">{name}</span>
          <Icon size={30} className="transition-transform duration-200 ease-out group-hover:scale-110" />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
