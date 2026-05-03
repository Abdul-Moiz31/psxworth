"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import CommunityJoinPromptWrapper from "./CommunityJoinPromptWrapper";

const CommunityPromptHandlerComponent: React.FC = () => {
  const [showCommunityPrompt, setShowCommunityPrompt] = useState(() => {
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const lastShownTimestamp = Number(localStorage.getItem("communityPromptLastShownTimestamp")) || 0;
    const optedOutUntil = Number(localStorage.getItem("communityPromptOptedOutUntil")) || 0;

    const withinCooldown = now - lastShownTimestamp < THREE_DAYS_MS;
    const isOptedOut = optedOutUntil > now;

    if (!withinCooldown && !isOptedOut) {
      localStorage.setItem("communityPromptLastShownTimestamp", now.toString());
      localStorage.removeItem("communityPromptOptedOutUntil");
      return true;
    }

    return false;
  });

  const handleCloseCommunityPrompt = () => {
    setShowCommunityPrompt(false);
  };

  return <CommunityJoinPromptWrapper isOpen={showCommunityPrompt} onClose={handleCloseCommunityPrompt} />;
};

// Export as a client-only dynamic component to avoid SSR/localStorage mismatch
const CommunityPromptHandler = dynamic(() => Promise.resolve(CommunityPromptHandlerComponent), { ssr: false });

export default CommunityPromptHandler;
