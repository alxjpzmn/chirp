import useSWRSubscription from "swr/subscription";
import type { SWRSubscriptionOptions } from "swr/subscription";
import { useSWRConfig } from "swr";

import { useEffect } from "react";
import { Box, Text, Flex, useColorModeValue, Progress } from "@chakra-ui/react";

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
    mutate("/api/audio");
  }, [(data as any)?.audioQueue]);

  const textColor = useColorModeValue("blackAlpha.700", "whiteAlpha.700");
  return (
    <>
      {(data as any)?.audioQueue?.map((item: any) => (
        <Box mb={4} shadow="xs" rounded="md" key={item.data?.id}>
          <Text w="100%" fontSize="sm" fontWeight="semibold" noOfLines={2}>
            {item.data?.title}
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
          <Progress size="xs" isIndeterminate />{" "}
        </Box>
      ))}
    </>
  );
};
