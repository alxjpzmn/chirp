import { db } from "@db/init";
import { transcripts } from "@db/schema";
import {
  FEED_DATA_FOLDER_NAME,
  FILE_FOLDER_NAME,
  FINISHED_RECORDINGS_RELATIVE_PATH,
} from "@util/misc/constants";
import createFolderIfNotExists from "@util/misc/createFolderIfNotExits";
import getAudioMetadata from "@util/misc/getAudioMetadata";
import getBasePath from "@util/misc/getBasePath";
import getFeedMetadata from "./getFeedMetadata";
import { Podcast } from "podcast";
import getPodcastFromFeed from "podparse";
import getServiceUrl from "@util/misc/getServiceUrl";

interface EpisodeMetadata {
  title: string;
  slug: string;
  id: number;
  length: number;
  size: number;
}

const createFeed = async () => {
  try {
    const transcripts = db.select().from(transcripts).all();

    const episodesToConsider = [];
    for (const entry of transcripts) {
      const recordingPath = `${getBasePath()}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${
        entry.id
      }.mp3`;

      const recordingFile = Bun.file(recordingPath);

      if (await recordingFile.exists()) {
        const { size, length } = await getAudioMetadata(
          `${getBasePath()}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${
            entry.id
          }.mp3`,
        );
        const episode: EpisodeMetadata = {
          title: entry.title ?? "Untitled",
          slug: entry.slug ?? "No description for this episode",
          id: entry.id,
          length: length ?? 0,
          size,
        };
        episodesToConsider.push(episode);
      }
    }

    createFolderIfNotExists(`${getBasePath()}/${FILE_FOLDER_NAME}`);
    createFolderIfNotExists(
      `${getBasePath()}/${FILE_FOLDER_NAME}/${FEED_DATA_FOLDER_NAME}`,
    );

    const feedPath = `${getBasePath()}/${FILE_FOLDER_NAME}/${FEED_DATA_FOLDER_NAME}/feed.xml`;
    const feedMetadata = getFeedMetadata();
    const basePodcastData = new Podcast({ ...feedMetadata });
    const feedXml = basePodcastData.buildXml();

    const podcast = getPodcastFromFeed(feedXml);

    const feed = new Podcast(
      feedMetadata,
      podcast.episodes.map((episode) => {
        return {
          ...episode,
          itunesDuration: episode.duration,
          date: episode.pubDate,
          enclosure: {
            ...episode.enclosure,
            size: episode.enclosure.length,
          },
        };
      }),
    );

    for (const episode of episodesToConsider) {
      feed.addItem({
        title: episode.title,
        description: episode.slug,
        url: getServiceUrl(),
        enclosure: {
          url: `${getServiceUrl()}/files/episode/${episode.id}`,
          type: "audio/mpeg",
          size: episode.size,
        },
        itunesExplicit: false,
        itunesTitle: episode.title,
        itunesSummary: episode.slug,
        author: "Chirp",
        date: new Date(),
        itunesDuration: episode.length,
        guid: `${episode.id}`,
      });
    }
    const xml = feed.buildXml();
    await Bun.write(`${feedPath}`, xml);
  } catch (error) {
    console.error(error);
  }
};

export default createFeed;
