import {
  Flex,
  Text,
  Button,
  Box,
  useColorModeValue,
  Card,
  CardBody,
  CardFooter,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { Trash } from "@phosphor-icons/react";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/util/api";
import {
  EPISODE_DESCRIPTION_PLACEHOLDER,
  EPISODE_TITLE_PLACEHOLDER,
} from "@chirp/shared/constants";

interface EpisodeListProps { }

export const EpisodeList: React.FC<EpisodeListProps> = ({ }) => {
  const textColor = useColorModeValue("blackAlpha.700", "whiteAlpha.700");
  const { data: episodes } = useSWR("/api/audio", fetcher);
  const { mutate } = useSWRConfig();

  const deleteEpisode = async (episodeId: number) => {
    await fetch(`/api/audio/${episodeId}`, { method: "DELETE" });
    mutate("/api/audio");
    mutate("/api/transcripts");
  };

  return (
    <VStack gap={4} w="100%">
      {episodes?.map((episode: any) => (
        <Card variant="outline" key={episode?.id} w="100%">
          <CardBody>
            <Text w="100%" fontSize="sm" fontWeight="semibold" noOfLines={2}>
              {episode?.title || EPISODE_TITLE_PLACEHOLDER}
            </Text>
            <Flex mb={2}>
              <Text fontSize="xs" textColor={textColor}>
                {episode?.url}
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
              {episode?.slug || EPISODE_DESCRIPTION_PLACEHOLDER}
            </Text>
            <Box width="100%">
              <audio
                controls
                style={{ width: "100%" }}
                src={`/files/episode/${episode?.id}`}
              />
            </Box>
          </CardBody>
          <CardFooter display="flex" justifyContent="flex-end">
            <Button
              onClick={() => deleteEpisode(episode?.id)}
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
