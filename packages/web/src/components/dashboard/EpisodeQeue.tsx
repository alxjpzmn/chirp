import { useSWRConfig } from "swr";

import { useContext, useEffect, useState } from "react";
import {
  Text,
  useColorModeValue,
  Progress,
  Card,
  CardBody,
  VStack,
  CardFooter,
  Button,
} from "@chakra-ui/react";
import {
  EPISODE_DESCRIPTION_PLACEHOLDER,
  EPISODE_TITLE_PLACEHOLDER,
} from "@chirp/shared/constants";
import { JobState } from "@chirp/shared/types";
import { Trash, Clock } from "@phosphor-icons/react";
import useSWRSubscription from "swr/subscription";
import { UserContentCountContext } from "@/pages/Dashboard";

export const EpisodeQueue = () => {
  const { mutate } = useSWRConfig();

  const [audioMessages, setAudioMessages] = useState([]);
  const { contentCount, setContentCount } = useContext(UserContentCountContext);

  const { data } = useSWRSubscription(
    `ws://${window.location.host}/sockets/audio_queue`,
    (key, { next }) => {
      const socket = new WebSocket(key);
      socket.addEventListener("message", (event) => {
        return next(null, JSON.parse(event.data));
      });
      return () => socket.close();
    },
  );

  useEffect(() => {
    if (data) {
      if (data.type === "initial") {
        setAudioMessages(
          data.payload.sort((a, b) => {
            return Number(b.jobId) - Number(a.jobId);
          }),
        );
      } else {
        data.payload.status === JobState.Added && mutate("/api/transcripts");
        data.payload.status === JobState.Completed && mutate("/api/audio");

        data.payload.status === JobState.Completed
          ? setAudioMessages((prev) =>
            prev.filter((message) => message.jobId !== data.payload.jobId),
          )
          : setAudioMessages((prev) =>
            prev
              .filter((message) => message.jobId !== data.payload.jobId)
              .concat(data.payload)
              .toReversed(),
          );
      }
    }
  }, [data, setAudioMessages]);

  useEffect(() => {
    setContentCount({
      ...contentCount,
      episodeQueue: audioMessages.length,
    });
  }, [audioMessages]);

  const textColor = useColorModeValue("blackAlpha.700", "whiteAlpha.700");
  return (
    <VStack gap={4} w="100%">
      {audioMessages?.map((item: any) => (
        <Card
          shadow="xs"
          rounded="md"
          key={item.data?.id}
          variant="outline"
          w="100%"
        >
          <CardBody>
            <Text w="100%" fontSize="sm" fontWeight="semibold" noOfLines={2}>
              {item.data?.title || EPISODE_TITLE_PLACEHOLDER}
            </Text>
            <Text fontSize="xs" textColor={textColor} w="100%">
              {item.data?.url}
            </Text>
            <Text
              w="100%"
              fontSize="sm"
              textColor={textColor}
              noOfLines={2}
              wordBreak="break-word"
              mb={4}
            >
              {item.data?.slug || EPISODE_DESCRIPTION_PLACEHOLDER}
            </Text>
            {item.status === JobState.Active && (
              <Progress size="xs" isIndeterminate borderRadius={2} />
            )}
            {item.status === JobState.Failed && (
              <Text fontSize="xs" color="red" fontFamily="monospace">
                {item.errorMessage}
              </Text>
            )}
            {(item.status === JobState.Added ||
              item.status === JobState.Wait) && (
                <Text
                  fontSize="xs"
                  color="orange"
                  fontFamily="monospace"
                  display="flex"
                  justifyItems="center"
                  gap={2}
                >
                  <Clock size={16} weight="bold" /> Waiting
                </Text>
              )}
          </CardBody>

          {(item.status === JobState.Failed ||
            item.status === JobState.Added ||
            item.status === JobState.Wait) && (
              <CardFooter>
                <Button
                  variant="link"
                  size="xs"
                  gap={2}
                  color="gray"
                  onClick={async () => {
                    await fetch(`/api/jobs/get_audio/${item.jobId}`, {
                      method: "DELETE",
                    });
                    mutate("/api/transcripts");
                    setAudioMessages(
                      audioMessages.filter(
                        (audioMessage) => audioMessage.jobId !== item.jobId,
                      ),
                    );
                  }}
                >
                  <Trash size={16} weight="bold" /> Delete
                </Button>
              </CardFooter>
            )}
        </Card>
      ))}
    </VStack>
  );
};
