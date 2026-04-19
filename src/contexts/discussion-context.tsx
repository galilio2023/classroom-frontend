import React, { createContext, useContext } from "react";

interface DiscussionContextType {
  isStaff: boolean;
  isAdmin: boolean;
  userId?: string;
}

const DiscussionContext = createContext<DiscussionContextType | undefined>(undefined);

export const DiscussionProvider: React.FC<{
  value: DiscussionContextType;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return <DiscussionContext.Provider value={value}>{children}</DiscussionContext.Provider>;
};

export const useDiscussion = () => {
  const context = useContext(DiscussionContext);
  if (context === undefined) {
    throw new Error("useDiscussion must be used within a DiscussionProvider");
  }
  return context;
};
