import { Flex, Text, Button, Box, useColorModeValue } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import SubHeading from "./SubHeading";
import { UilCheck } from "@iconscout/react-unicons";

interface ContentQueueProps { }

export const ContentQueue: React.FC<ContentQueueProps> = ({ }) => {
  const [transcripts, setTranscripts] = useState([]);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/transcripts");
      const transcriptResponse = await res.json();

      setTranscripts(transcriptResponse);
    })();
  }, []);

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
              <Text
                fontSize="xs"
                // eslint-disable-next-line react-hooks/rules-of-hooks
                textColor={useColorModeValue(
                  "blackAlpha.700",
                  "whiteAlpha.700",
                )}
              >
                {transcript?.url}
              </Text>
            </Flex>
            <Text
              w="100%"
              fontSize="sm"
              // eslint-disable-next-line react-hooks/rules-of-hooks
              textColor={useColorModeValue("blackAlpha.700", "whiteAlpha.700")}
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
