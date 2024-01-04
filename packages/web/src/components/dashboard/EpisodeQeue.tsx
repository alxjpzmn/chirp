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
} from "@chakra-ui/react";
import { TITLE_PLACEHOLDER } from "@chirp/shared/constants";

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
  }, [(data as any)?.audioQueue]);

  const textColor = useColorModeValue("blackAlpha.700", "whiteAlpha.700");
  return (
    <VStack gap={4} w="100%">
      {(data as any)?.audioQueue?.map((item: any) => (
        <Card
          shadow="xs"
          rounded="md"
          key={item.data?.id}
          variant="outline"
          w="100%"
        >
          <CardBody>
            <Text w="100%" fontSize="sm" fontWeight="semibold" noOfLines={2}>
              {item.data?.title || TITLE_PLACEHOLDER}
            </Text>
            <Flex mb={2}>
              <Text fontSize="xs" textColor={textColor}>
                {item.data?.url}
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
              {item.data?.slug}
            </Text>
            <Progress size="xs" isIndeterminate />
          </CardBody>
        </Card>
      ))}
    </VStack>
  );
};
