import { PollyClient, StartSpeechSynthesisTaskCommand } from "@aws-sdk/client-polly";

const polly = new PollyClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const generatePodcastAudio = async (plainText, blogId) => {
  
  const params = {
    OutputFormat: "mp3",
    Text: plainText,
    VoiceId: "Ruth",
    Engine: "long-form",
    LanguageCode: "en-US",
    OutputS3BucketName: "quickblog-podcasts",
    OutputS3KeyPrefix: `blog-${blogId}/audio`,
  };

  const command = new StartSpeechSynthesisTaskCommand(params);
  const response = await polly.send(command);

  // Response contains a URL like:
  // response.SynthesisTask.OutputUri = "https://s3.amazonaws.com/quickblog-podcasts/blog-123/task123.mp3"
  
  return response.SynthesisTask.OutputUri;
};
