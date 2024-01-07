import {
  Flex,
  Text,
  Button,
  useColorModeValue,
  Card,
  CardBody,
  VStack,
  CardFooter,
} from "@chakra-ui/react";
import { Trash, Waveform } from "@phosphor-icons/react";
import useSWR from "swr";
import { fetcher } from "@/util/api";
import {
  TRANSCRIPT_DESCRIPTION_PLACEHOLDER,
  TRANSCRIPT_TITLE_PLACEHOLDER,
} from "@chirp/shared/constants";
import { UserContentCountContext } from "@/pages/Dashboard";
import React, { useContext, useEffect } from "react";

export const TranscriptList = () => {
  const { contentCount, setContentCount } = useContext(UserContentCountContext);
  const textColor = useColorModeValue("blackAlpha.700", "whiteAlpha.700");
  const { data: transcripts, mutate } = useSWR("/api/transcripts", fetcher);

  const deleteTranscript = async (transcriptId: string) => {
    await fetch(`/api/transcripts/${transcriptId}`, { method: "DELETE" });
    mutate();
  };

  useEffect(() => {
    if (transcripts) {
      setContentCount({
        ...contentCount,
        transcripts: transcripts?.length,
      });
    }
  }, [transcripts]);

  return (
    <VStack gap={4} w="100%">
      {transcripts
        ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((transcript: any) => (
          <Card key={transcript?.id} variant="outline" w="100%">
            <CardBody>
              <Text w="100%" fontSize="sm" fontWeight="semibold" noOfLines={2}>
                {transcript?.title || TRANSCRIPT_TITLE_PLACEHOLDER}
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
                {transcript?.slug || TRANSCRIPT_DESCRIPTION_PLACEHOLDER}
              </Text>
            </CardBody>
            <CardFooter
              width="100%"
              display="flex"
              justifyContent="space-between"
            >
              <Button
                onClick={async () =>
                  await fetch("/api/audio/", {
                    method: "POST",
                    body: JSON.stringify({ id: transcript?.id }),
                  })
                }
                size="xs"
                variant="outline"
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
            </CardFooter>
          </Card>
        ))}
    </VStack>
  );
};

export default TranscriptList;
