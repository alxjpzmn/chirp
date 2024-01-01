import getServiceUrl from "@util/misc/getServiceUrl";

const getFeedMetadata = () => {
  return {
    title: "Chirp TTS Feed",
    author: "Chirp",
    siteUrl: getServiceUrl(),
    feedUrl: `${getServiceUrl()}/files/feed`,
    imageUrl: `${getServiceUrl()}/files/cover`,
    categories: ["News", "Daily News"],
    itunesCategory: [{ text: "News", subcats: [{ text: "Daily News" }] }],
    itunesAuthor: "Chirp",
    itunesSubtitle: "My personal feed of TTS'ed text content",
    itunesImage: `${getServiceUrl()}/files/cover`,
    itunesExplicit: false,
    itunesOwner: { name: "Chirp", email: "no-reply@chirp" },
    language: "en",
    pubDate: new Date(),
    itunesSummary: "Your texts — read out loud for you via OpenAI's TTS API.",
  };
};

export default getFeedMetadata;
