const ffmpegInstance = (): any => {
  const ffmpeg = require("fluent-ffmpeg");
  if (Bun.env.NODE_ENV === "production") {
    ffmpeg.setFfmpegPath("/usr/local/bin/ffmpeg");
    ffmpeg.setFfprobePath("/usr/local/bin/ffprobe");
  } else {
    const ffmpegExecPath = require("ffmpeg-static");
    console.log(`Path to Ffmpeg: ${ffmpegExecPath}`);
    ffmpeg.setFfmpegPath(ffmpegExecPath);

    const ffprobeExecPath = require("ffprobe-static").path;
    console.log(`Path to Ffprobe: ${ffprobeExecPath}`);
    ffmpeg.setFfprobePath(ffprobeExecPath);
  }
  return ffmpeg();
};
export default ffmpegInstance;
