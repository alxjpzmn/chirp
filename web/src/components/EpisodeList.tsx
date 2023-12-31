import { Flex, Text, Button, Box, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import SubHeading from "./SubHeading";
import { UilTrash } from "@iconscout/react-unicons";
import useSWR from "swr";
import { fetcher } from "../util/api";

interface EpisodeListProps { }

export const EpisodeList: React.FC<EpisodeListProps> = ({ }) => {
  const { data: episodes, error } = useSWR("/api/audio", fetcher);
  return (
    <>
      {!!episodes?.length && (
        <Box w="100%">
          <Flex width="100%" justifyContent="space-between" alignItems="center">
            <Text fontWeight={600}>Episodes</Text>
          </Flex>
          <SubHeading>Manage what shows up in your feed</SubHeading>
          {episodes?.map((episode: any) => (
            <Box mb={4} shadow="xs" p={4} rounded="md" key={episode?.id}>
              <Text w="100%" fontSize="sm" fontWeight="semibold" noOfLines={2}>
                {episode?.title}
              </Text>
              <Flex mb={2}>
                <Text
                  fontSize="xs"
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  textColor={useColorModeValue(
                    "blackAlpha.700",
                    "whiteAlpha.700",
                  )}
                >
                  {episode?.url}
                </Text>
              </Flex>
              <Text
                w="100%"
                fontSize="sm"
                // eslint-disable-next-line react-hooks/rules-of-hooks
                textColor={useColorModeValue(
                  "blackAlpha.700",
                  "whiteAlpha.700",
                )}
                noOfLines={2}
                wordBreak="break-word"
                mb={4}
              >
                {episode?.slug}
              </Text>
              <Box mb={2} width="100%">
                <audio
                  controls
                  style={{ width: "100%" }}
                  src={`http://localhost:3000/files/episode/${episode?.id}`}
                />
              </Box>
              <Button
                onClick={() => console.log("delete action triggered")}
                size="xs"
                variant="link"
                color="red"
                gap={1}
              >
                <UilTrash size={16} />
                Delete
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
};
