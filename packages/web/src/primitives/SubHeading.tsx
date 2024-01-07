import {
  forwardRef,
  Text,
  TextProps,
  useColorModeValue,
} from "@chakra-ui/react";

const SubHeading = forwardRef<TextProps, "h2">((props, ref) => {
  const color = useColorModeValue("blackAlpha.700", "whiteAlpha.700");
  return <Text width="100%" color={color} mb={4} ref={ref} {...props}></Text>;
});

export default SubHeading;
