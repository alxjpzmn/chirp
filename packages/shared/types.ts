export enum JobState {
  Added = "added",
  Failed = "failed",
  Delayed = "delayed",
  Active = "active",
  Wait = "wait",
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
