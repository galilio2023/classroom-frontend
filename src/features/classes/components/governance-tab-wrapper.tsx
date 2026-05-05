import React from "react";
import { GovernanceTab } from "../pages/governance-tab";

interface GovernanceTabWrapperProps {
  classId: string;
}

export const GovernanceTabWrapper: React.FC<GovernanceTabWrapperProps> = ({ classId }) => {
  return <GovernanceTab classId={classId} />;
};
