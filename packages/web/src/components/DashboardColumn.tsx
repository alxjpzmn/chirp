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
        <Heading size="md" mb={4}>
          {heading}
        </Heading>
        <VStack py={0} spacing={4}>
          {children}
        </VStack>
      </Box>
    </Box>
  );
};
