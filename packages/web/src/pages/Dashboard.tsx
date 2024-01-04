import { Grid, GridItem, Box, VStack } from "@chakra-ui/react";
import { DashboardColumn } from "@/components/dashboard/DashboardColumn";
import { EpisodeList } from "@/components/dashboard/EpisodeList";
import { AddArticle } from "@/components/dashboard/AddArticle";
import { TranscriptList } from "@/components/dashboard/TranscriptList";
import { EpisodeQueue } from "@/components/dashboard/EpisodeQeue";
import { TranscriptQueue } from "@/components/dashboard/TranscriptQueue";
import FeedDisplay from "@/components/dashboard/FeedDisplay";
import { DashboardColumnSectionHeader } from "@/components/dashboard/DashboardColumnHeader";

export const Dashboard = () => {
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
        <GridItem>
          <DashboardColumn heading="Add Content">
            <AddArticle />
            <Box w="100%">
              <DashboardColumnSectionHeader
                heading="Transcripts"
                subHeading="Get audio for new items"
              />
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
              <DashboardColumnSectionHeader
                heading="Episodes"
                subHeading="Manage what shows up in your feed"
              />
              <VStack gap={4} w="100%">
                <EpisodeQueue />
                <EpisodeList />
              </VStack>
            </Box>
          </DashboardColumn>
        </GridItem>
      </Grid>
    </Box>
  );
};
