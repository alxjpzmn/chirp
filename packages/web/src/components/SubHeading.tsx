import {
  forwardRef,
  Text,
  TextProps,
  useColorModeValue,
} from "@chakra-ui/react";

const SubHeading = forwardRef<TextProps, "h2">((props, ref) => {
  return (
    <Text
      width="100%"
      color={useColorModeValue("blackAlpha.700", "whiteAlpha.700")}
      mb={4}
      ref={ref}
      {...props}
    ></Text>
  );
});

export default SubHeading;
