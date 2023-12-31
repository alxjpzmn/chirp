import React from "react";
import useSWRSubscription from "swr/subscription";
import { useSWRConfig } from "swr";

import type { SWRSubscriptionOptions } from "swr/subscription";
import { useEffect } from "react";

export const TranscriptQueue = (props: {}) => {
  const { mutate } = useSWRConfig();
  const { data, error } = useSWRSubscription(
    "ws://localhost:3000/sockets/status/transcripts",
    (key, { next }: SWRSubscriptionOptions<number, Error>) => {
      const socket = new WebSocket(key);
      socket.addEventListener("open", (event) => { });
      socket.addEventListener("message", (event) => {
        console.log(event.data);
        mutate("/api/transcripts");
        return next(null, JSON.parse(event.data));
      });
      socket.addEventListener("error", (event) => next(event.error));
      return () => socket.close();
    },
  );
  return (
    <div>
      {data?.audioQueue?.map((item) => (
        <>extracting text for {item.data.title}</>
      ))}
    </div>
  );
};
