// User confirmed to ignore this error for now
import VisuallyHidden from "@/components/VisuallyHidden";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { DialogTitle } from "@radix-ui/react-dialog";
import React from "react";
import { useMediaQuery } from "usehooks-ts";
import CommunityJoinPrompt from "./CommunityJoinPrompt";

interface CommunityJoinPromptWrapperProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommunityJoinPromptWrapper: React.FC<CommunityJoinPromptWrapperProps> = ({ isOpen, onClose }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)"); // Assuming md breakpoint is 768px as per TailwindCSS default

  if (!isOpen) return null;

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[480px] md:max-w-[500px]">
          <VisuallyHidden>
            <DialogTitle>Community Join Prompt</DialogTitle>
          </VisuallyHidden>
          <CommunityJoinPrompt onClose={onClose} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <CommunityJoinPrompt onClose={onClose} />
      </DrawerContent>
    </Drawer>
  );
};

export default CommunityJoinPromptWrapper;
