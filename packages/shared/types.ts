export enum JobState {
  Added = "added",
  Failed = "failed",
  Delayed = "delayed",
  Active = "active",
  Wait = "waiting",
  WaitingChildren = "waiting-children",
  Prioritized = "prioritized",
  Paused = "paused",
  Repeat = "repeat",
  Completed = "completed",
}

export const jobStates: JobState[] = [
  JobState.Added,
  JobState.Failed,
  JobState.Delayed,
  JobState.Active,
  JobState.Wait,
  JobState.WaitingChildren,
  JobState.Prioritized,
  JobState.Paused,
  JobState.Repeat,
  JobState.Completed,
];

export interface AudioJobData {
  id: number;
  text: string;
  title: string;
  slug: string;
}

export interface AudioEventMessage {
  jobId: string;
  data: AudioJobData;
  status: JobState;
  errorMessage?: string;
}

export interface ExtractTextJobData {
  id: number;
  text: string;
  title: string;
  slug: string;
}

export interface TranscriptEventMessage {
  jobId: string;
  data: ExtractTextJobData;
  status: JobState;
  errorMessage?: string;
}
