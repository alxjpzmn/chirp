import {
  FEED_DATA_FOLDER_NAME,
  FILE_FOLDER_NAME,
  FINISHED_RECORDINGS_RELATIVE_PATH,
} from "@util/misc/constants";
import createFolderIfNotExists from "@util/misc/createFolderIfNotExits";
import getAudioMetadata from "@util/misc/getAudioMetadata";
import getDataDirPath from "@util/misc/getDataDirPath";
import getFeedMetadata from "./getFeedMetadata";
import { Podcast } from "podcast";
import getPodcastFromFeed from "podparse";
import db from "@db/init";
import {
  EPISODE_TITLE_PLACEHOLDER,
  EPISODE_DESCRIPTION_PLACEHOLDER,
} from "@chirp/shared/constants";

interface EpisodeMetadata {
  title: string;
  slug: string;
  id: number;
  pubDate: Date;
  length: number;
  size: number;
}

const createFeed = async (host: string) => {
  try {
    const transcriptQuery = db.query("SELECT * FROM transcripts;");
    const stored_transcripts: any = transcriptQuery.all();

    const episodesToConsider = [];
    for (const entry of stored_transcripts) {
      const recordingPath = `${getDataDirPath()}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${entry.id
        }.mp3`;

      const recordingFile = Bun.file(recordingPath);

      if (await recordingFile.exists()) {
        const { size, length } = await getAudioMetadata(
          `${getDataDirPath()}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${entry.id
          }.mp3`,
        );
        const episode: EpisodeMetadata = {
          title: entry.title ?? EPISODE_TITLE_PLACEHOLDER,
          slug: entry.slug ?? EPISODE_DESCRIPTION_PLACEHOLDER,
          pubDate: entry.updated_at,
          id: entry.id,
          length: length ?? 0,
          size,
        };
        episodesToConsider.push(episode);
      }
    }

    createFolderIfNotExists(
      `${getDataDirPath()}/${FILE_FOLDER_NAME}/${FEED_DATA_FOLDER_NAME}`,
    );

    const feedPath = `${getDataDirPath()}/${FILE_FOLDER_NAME}/${FEED_DATA_FOLDER_NAME}/feed.xml`;
    const feedMetadata = getFeedMetadata(host);
    const basePodcastData = new Podcast({ ...feedMetadata });
    const feedXml = basePodcastData.buildXml();

    const podcast = getPodcastFromFeed(feedXml);

    const feed = new Podcast(
      feedMetadata,
      podcast.episodes.map((episode) => {
        return {
          ...episode,
          itunesDuration: episode.duration,
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
        url: host,
        enclosure: {
          url: `${host}/files/episode/${episode.id}.mp3`,
          type: "audio/mpeg",
          size: episode.size,
        },
        itunesExplicit: false,
        itunesTitle: episode.title,
        itunesSummary: episode.slug,
        author: "Chirp",
        date: episode.pubDate,
        itunesDuration: episode.length,
        guid: `${episode.id}`,
      });
    }
    const xml = feed.buildXml();
    await Bun.write(`${feedPath}`, xml);
  } catch (e) {
    console.error(e);
  }
};

export default createFeed;
