import { useEffect } from "react";
import "./App.css";
import { Grid, GridItem, Box, Spacer } from "@chakra-ui/react";
import { DashboardColumn } from "./components/DashboardColumn";
import RSSDisplay from "./components/FeedDisplay";
import DashboardSection from "./components/DashboardSection";
import { EpisodeList } from "./components/EpisodeList";
import { AddArticle } from "./components/AddArticle";
import ContentQueue from "./components/ContentQueue";
import { AudioQueue } from "./components/AudioQueue";
import { TranscriptQueue } from "./components/TranscriptQueue";

function App() {
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/health");
      console.log(await res.text());
    })();
  }, []);

  return (
    <Box w="full" display="flex" justifyContent="center">
      <Grid
        templateColumns={{ lg: "1fr 1fr", base: "1fr" }}
        templateRows={{ lg: "1", base: "2" }}
        gap={4}
        w="full"
        maxW="4xl"
        p={[2, 8]}
      >
        <GridItem>
          <DashboardColumn heading="Add Content">
            <DashboardSection>
              <AddArticle />
            </DashboardSection>
            <Spacer h={8} />
            <DashboardSection>
              <TranscriptQueue />
              <ContentQueue />
            </DashboardSection>
          </DashboardColumn>
        </GridItem>
        <GridItem>
          <DashboardColumn heading="Listen">
            <DashboardSection>
              <RSSDisplay />
            </DashboardSection>
            <Spacer />
            <DashboardSection>
              <AudioQueue />
              <EpisodeList />
            </DashboardSection>
          </DashboardColumn>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default App;
