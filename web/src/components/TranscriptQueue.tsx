import useSWRSubscription from "swr/subscription";
import { useSWRConfig } from "swr";

export const TranscriptQueue = () => {
  const { mutate } = useSWRConfig();
  const { data } = useSWRSubscription(
    `ws://${window.location.host}/sockets/transcripts_queue`,
    (key, { next }) => {
      const socket = new WebSocket(key);
      socket.addEventListener("message", (event) => {
        mutate("/api/transcripts");
        return next(null, JSON.parse(event.data));
      });
      return () => socket.close();
    },
  );
  return (
    <div>
      {(data as any)?.audioQueue?.map((item: any) => (
        <>extracting text for {item.data.title}</>
      ))}
    </div>
  );
};
