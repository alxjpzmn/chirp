import { Flex, Text, Button, Box, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import SubHeading from "./SubHeading";
// @ts-ignore
import { UilCheck } from "@iconscout/react-unicons";
import useSWR from "swr";
import { fetcher } from "../util/api";

interface ContentQueueProps { }

export const ContentQueue: React.FC<ContentQueueProps> = ({ }) => {
  const { data: transcripts } = useSWR("/api/transcripts", fetcher);
  const textColor = useColorModeValue("blackAlpha.700", "whiteAlpha.700");

  return (
    <>
      <Box w="100%">
        <Flex width="100%" justifyContent="space-between" alignItems="center">
          <Text fontWeight={600}>Transcripts</Text>
        </Flex>
        <SubHeading>Get audio for new items</SubHeading>
        {transcripts?.map((transcript: any) => (
          <Box mb={4} shadow="xs" p={4} rounded="md" key={transcript?.id}>
            <Text w="100%" fontSize="sm" fontWeight="semibold" noOfLines={2}>
              {transcript?.title}
            </Text>
            <Flex mb={2}>
              <Text fontSize="xs" textColor={textColor}>
                {transcript?.url}
              </Text>
            </Flex>
            <Text
              w="100%"
              fontSize="sm"
              textColor={textColor}
              noOfLines={2}
              wordBreak="break-word"
              mb={4}
            >
              {transcript?.slug}
            </Text>
            <Button
              onClick={async () =>
                await fetch("/api/audio/", {
                  method: "POST",
                  body: JSON.stringify({ id: transcript?.id }),
                })
              }
              size="xs"
              color="green"
              gap={1}
            >
              <UilCheck size={16} />
              Get Audio
            </Button>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default ContentQueue;
