import { Flex, Text, Button, Box, useColorModeValue } from "@chakra-ui/react";
import SubHeading from "./SubHeading";
import { Trash, Waveform } from "@phosphor-icons/react";
import useSWR from "swr";
import { fetcher } from "../util/api";

export const TranscriptList = ({ }) => {
  const { data: transcripts, mutate } = useSWR("/api/transcripts", fetcher);
  const textColor = useColorModeValue("blackAlpha.700", "whiteAlpha.700");

  const deleteTranscript = async (transcriptId) => {
    await fetch(`/api/transcripts/${transcriptId}`, { method: "DELETE" });
    mutate();
  };

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
            <Box width="100%" display="flex" justifyContent="space-between">
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
                <Waveform size={16} weight="bold" />
                Get Audio
              </Button>
              <Button
                onClick={() => deleteTranscript(transcript?.id)}
                size="xs"
                variant="link"
                color="red"
                gap={1}
              >
                <Trash size={16} weight="bold" />
                Delete
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default TranscriptList;
