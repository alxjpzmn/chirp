import { Box, BoxProps, useColorModeValue } from "@chakra-ui/react";

export const DashboardCard = (props: BoxProps) => (
  <Box
    bg={useColorModeValue("white", "gray.700")}
    py={props.py ?? "8"}
    px={props.px ?? { base: "4", md: "10" }}
    shadow={props.shadow ?? "base"}
    rounded={props.rounded ?? { sm: "lg" }}
    {...props}
  />
);
