import useSWRSubscription from "swr/subscription";
import { useSWRConfig } from "swr";

import type { SWRSubscriptionOptions } from "swr/subscription";
import { useEffect } from "react";

export const AudioQueue = () => {
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

  return (
    <div>
      {(data as any)?.audioQueue?.map((item: any) => (
        <>getting audio for {item.data.title}</>
      ))}
    </div>
  );
};
