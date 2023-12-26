import { DashboardCard } from "./DasboardCard";
import React, { ReactNode } from "react";

interface DashboardSectionProps {
  children: ReactNode;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ children }) => {
  return (
    <DashboardCard w="100%" px={0} py={0} shadow={0}>
      {children}
    </DashboardCard>
  );
};

export default DashboardSection;
