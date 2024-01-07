import SubHeading from "@/primitives/SubHeading";
import { Flex, Text, Box } from "@chakra-ui/react";
import React from "react";

interface DashboardColumnSectionHeaderProps {
  heading: string;
  subHeading: string;
}

export const DashboardColumnSectionHeader: React.FC<
  DashboardColumnSectionHeaderProps
> = ({ heading, subHeading }) => {
  return (
    <Box>
      <Text fontWeight={600}>{heading}</Text>
      <SubHeading>{subHeading}</SubHeading>
    </Box>
  );
};
