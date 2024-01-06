import { Grid, GridItem, Box, VStack } from "@chakra-ui/react";
import { DashboardColumn } from "@/components/dashboard/DashboardColumn";
import { EpisodeList } from "@/components/dashboard/EpisodeList";
import { AddArticle } from "@/components/dashboard/AddArticle";
import { TranscriptList } from "@/components/dashboard/TranscriptList";
import { EpisodeQueue } from "@/components/dashboard/EpisodeQeue";
import { TranscriptQueue } from "@/components/dashboard/TranscriptQueue";
import FeedDisplay from "@/components/dashboard/FeedDisplay";
import { DashboardColumnSectionHeader } from "@/components/dashboard/DashboardColumnHeader";
import { createContext, useState } from "react";

export const UserContentCountContext = createContext({
  contentCount: {
    transcripts: 0,
    transcriptQueue: 0,
    episodes: 0,
    episodeQueue: 0,
  },
  setContentCount: () => { },
});

export const Dashboard = () => {
  const [contentCount, setContentCount] = useState({
    transcripts: 0,
    transcriptQueue: 0,
    episodes: 0,
    episodeQueue: 0,
  });

  return (
    <Box w="full" display="flex" justifyContent="center">
      <Grid
        templateColumns={{ lg: "1fr 1fr", base: "1fr" }}
        templateRows={{ lg: "1", base: "2" }}
        gap={12}
        w="full"
        maxW="6xl"
        p={[2, 8]}
      >
        <UserContentCountContext.Provider
          value={{ contentCount, setContentCount }}
        >
          <GridItem>
            <DashboardColumn heading="Add Content">
              <AddArticle />
              <Box w="100%">
                {(contentCount.transcriptQueue > 0 ||
                  contentCount.transcripts > 0) && (
                    <DashboardColumnSectionHeader
                      heading="Transcripts"
                      subHeading="Get audio for new items"
                    />
                  )}
                <VStack gap={4} w="100%">
                  <TranscriptQueue />
                  <TranscriptList />
                </VStack>
              </Box>
            </DashboardColumn>
          </GridItem>
          <GridItem>
            <DashboardColumn heading="Listen">
              <FeedDisplay />
              <Box w="100%">
                {(contentCount.episodeQueue > 0 ||
                  contentCount.episodes > 0) && (
                    <DashboardColumnSectionHeader
                      heading="Episodes"
                      subHeading="Manage what shows up in your feed"
                    />
                  )}
                <VStack gap={4} w="100%">
                  <EpisodeQueue />
                  <EpisodeList />
                </VStack>
              </Box>
            </DashboardColumn>
          </GridItem>
        </UserContentCountContext.Provider>
      </Grid>
    </Box>
  );
};
