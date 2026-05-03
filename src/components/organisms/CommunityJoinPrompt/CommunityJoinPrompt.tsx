import SocialLinks from "@/components/molecules/SocialLinks";
import { Button } from "@/components/ui/button";
import React from "react";

interface CommunityJoinPromptProps {
  onClose: () => void;
}

const CommunityJoinPrompt: React.FC<CommunityJoinPromptProps> = ({ onClose }) => {
  return (
    <div className="text-center p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome to PsxWorth!</h2>
      <p className="mb-6 text-gray-300">
        Join our growing community to discuss investment strategies, report bugs, and even request new features directly
        from me.
      </p>
      <p className="mb-6 text-gray-300">I recommend Joining WhatsApp or Reddit community</p>
      <div className="flex justify-center mb-6">
        <SocialLinks />
      </div>
      <Button onClick={onClose} className="w-full">
        Continue to Portfolio
      </Button>
    </div>
  );
};

export default CommunityJoinPrompt;
