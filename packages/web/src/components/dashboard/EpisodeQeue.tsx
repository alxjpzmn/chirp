import useSWRSubscription from "swr/subscription";
import type { SWRSubscriptionOptions } from "swr/subscription";
import { useSWRConfig } from "swr";

import { useEffect } from "react";
import {
  Text,
  Flex,
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
import { Trash } from "@phosphor-icons/react";

export const EpisodeQueue = () => {
  const { mutate } = useSWRConfig();

  const { data } = useSWRSubscription(
    `ws://${window.location.host}/sockets/audio_queue`,
    (key, { next }: SWRSubscriptionOptions<number, Error>) => {
      const socket = new WebSocket(key);
      socket.addEventListener("message", (event) => {
        return next(null, JSON.parse(event.data));
      });
      return () => socket.close();
    },
  );

  useEffect(() => {
    mutate("/api/transcripts");
    mutate("/api/audio");
  }, [(data as any)?.audioMessages]);

  const textColor = useColorModeValue("blackAlpha.700", "whiteAlpha.700");
  return (
    <VStack gap={4} w="100%">
      {(data as any)?.audioMessages?.map((item: any) => (
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
            {item.status === JobState.Added && (
              <Progress size="xs" isIndeterminate borderRadius={2} />
            )}
            {item.status === JobState.Failed && (
              <Text fontSize="xs" color="red" fontFamily="monospace">
                Error: {item.errorMessage}
              </Text>
            )}
          </CardBody>

          {item.status === JobState.Failed && (
            <CardFooter>
              <Button
                variant="link"
                size="xs"
                gap={2}
                color="gray"
                onClick={async () => {
                  await fetch(`/api/jobs/${item.jobId}`, {
                    method: "DELETE",
                  });
                }}
              >
                <Trash size={16} weight="bold" /> Delete Job
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </VStack>
  );
};
