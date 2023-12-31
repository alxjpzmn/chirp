import useSWRSubscription from "swr/subscription";
import { useSWRConfig } from "swr";

import type { SWRSubscriptionOptions } from "swr/subscription";
import { useEffect } from "react";

export const AudioQueue = () => {
  const { mutate } = useSWRConfig();

  const { data, error } = useSWRSubscription(
    "ws://localhost:3000/sockets/status/audio",
    (key, { next }: SWRSubscriptionOptions<number, Error>) => {
      const socket = new WebSocket(key);
      socket.addEventListener("open", (event) => { });
      socket.addEventListener("message", (event) => {
        return next(null, JSON.parse(event.data));
      });
      socket.addEventListener("error", (event) => next(event.error));
      return () => socket.close();
    },
  );

  useEffect(() => {
    mutate("/api/audio");
  }, [data?.audioQueue]);

  return (
    <div>
      {data?.audioQueue?.map((item) => (
        <>getting audio for {item.data.title}</>
      ))}
    </div>
  );
};
