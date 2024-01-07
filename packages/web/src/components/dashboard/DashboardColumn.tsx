import { Box, Heading, VStack } from "@chakra-ui/react";
import React from "react";

interface DashboardColumnProps {
  heading: string;
  children: React.ReactNode;
}

export const DashboardColumn: React.FC<DashboardColumnProps> = ({
  children,
  heading,
}) => {
  return (
    <Box w="full">
      <Box w="100%" shadow="none">
        <Heading size="lg" mb={4} fontWeight="900">
          {heading}
        </Heading>
        <VStack spacing={12}>{children}</VStack>
      </Box>
    </Box>
  );
};
