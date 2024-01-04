import useSWRSubscription from "swr/subscription";
import { useSWRConfig } from "swr";
import { useEffect } from "react";
import {
  Card,
  Progress,
  VStack,
  Text,
  useColorModeValue,
  CardBody,
} from "@chakra-ui/react";

export const TranscriptQueue = () => {
  const { mutate } = useSWRConfig();
  const { data } = useSWRSubscription(
    `ws://${window.location.host}/sockets/transcripts_queue`,
    (key, { next }) => {
      const socket = new WebSocket(key);
      socket.addEventListener("message", (event) => {
        return next(null, JSON.parse(event.data));
      });
      return () => socket.close();
    },
  );
  useEffect(() => {
    mutate("/api/transcripts");
  }, [(data as any)?.transcriptQueue]);

  const textColor = useColorModeValue("blackAlpha.700", "whiteAlpha.700");

  return (
    <VStack gap={4} w="100%">
      {(data as any)?.transcriptQueue?.map((item: any) => (
        <Card variant="outline" w="full" key={item?.id}>
          <CardBody>
            <Text
              w="100%"
              fontSize="sm"
              textColor={textColor}
              noOfLines={2}
              wordBreak="break-word"
              mb={4}
            >
              Extracting text for {item.data.url}
            </Text>
            <Progress size="xs" isIndeterminate />
          </CardBody>
        </Card>
      ))}
    </VStack>
  );
};
