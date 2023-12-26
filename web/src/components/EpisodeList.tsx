import { Flex, Text, Box } from "@chakra-ui/react";
import React, { useEffect } from "react";
import SubHeading from "./SubHeading";

interface EpisodeListProps { }

export const EpisodeList: React.FC<EpisodeListProps> = ({ }) => {
  // fetch episodes here, handle empty states
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/audio");
      console.log(await res.json());
    })();
  }, []);

  const episodes = [];
  return (
    <>
      <Box w="100%">
        <Flex width="100%" justifyContent="space-between" alignItems="center">
          <Text fontWeight={600}>Episodes</Text>
        </Flex>
        <SubHeading>Manage Episodes</SubHeading>
      </Box>
    </>
  );
};
