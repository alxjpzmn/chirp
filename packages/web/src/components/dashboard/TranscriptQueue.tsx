import useSWRSubscription from "swr/subscription";
import { useSWRConfig } from "swr";
import { useContext, useEffect, useState } from "react";
import {
  Card,
  Progress,
  VStack,
  Text,
  useColorModeValue,
  CardBody,
  CardFooter,
  Button,
} from "@chakra-ui/react";
import { JobState } from "@chirp/shared/types";
import { Trash, Clock } from "@phosphor-icons/react";
import { UserContentCountContext } from "@/pages/Dashboard";

export const TranscriptQueue = () => {
  const { mutate } = useSWRConfig();
  const [transcriptMessages, setTranscriptMessages] = useState([]);

  const { contentCount, setContentCount } = useContext(UserContentCountContext);

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
    if (data) {
      if (data.type === "initial") {
        setTranscriptMessages(
          data.payload.sort((a, b) => {
            return Number(b.jobId) - Number(a.jobId);
          }),
        );
      } else {
        data.payload.status === JobState.Completed &&
          mutate("/api/transcripts");
        data.payload.status === JobState.Completed
          ? setTranscriptMessages((prev) =>
            prev.filter((message) => message.jobId !== data.payload.jobId),
          )
          : setTranscriptMessages((prev) =>
            prev
              .filter((message) => message.jobId !== data.payload.jobId)
              .concat(data.payload)
              .toReversed(),
          );
      }
    }
  }, [data, setTranscriptMessages]);

  const textColor = useColorModeValue("blackAlpha.700", "whiteAlpha.700");

  useEffect(() => {
    setContentCount({
      ...contentCount,
      transcriptQueue: transcriptMessages.length,
    });
  }, [transcriptMessages]);

  return (
    <VStack gap={4} w="100%">
      {transcriptMessages.map((item: any) => (
        <Card variant="outline" w="full" key={item?.jobId}>
          <CardBody>
            <Text
              w="100%"
              fontSize="sm"
              textColor={textColor}
              noOfLines={2}
              wordBreak="break-word"
              mb={4}
            >
              Extracting text for {item.data.payload.url}
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
                    await fetch(`/api/jobs/extract_text/${item.jobId}`, {
                      method: "DELETE",
                    });
                    mutate("/api/transcripts");
                    setTranscriptMessages(
                      transcriptMessages.filter(
                        (transcriptMessage) =>
                          transcriptMessage.jobId !== item.jobId,
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
