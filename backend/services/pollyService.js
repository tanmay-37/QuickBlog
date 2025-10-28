import { PollyClient, StartSpeechSynthesisTaskCommand } from "@aws-sdk/client-polly";
// You only need S3 imports if you plan to manage ACLs manually after task completion.
// For the bucket policy approach, these are not required here.
// import { S3Client, PutObjectAclCommand } from "@aws-sdk/client-s3";

// --- Polly Client Initialization (AWS SDK v3) ---
const pollyClient = new PollyClient({
  // Region is automatically picked up from the AWS_REGION environment variable.
  // Set AWS_REGION in your .env file (e.g., AWS_REGION=us-east-1).
  // Defaults to us-east-1 if AWS_REGION is not set.
  region: process.env.AWS_REGION || "us-east-1",
  // Credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) are automatically picked up
  // from environment variables by the SDK. Ensure they are set in your .env file.
});

// --- Main Function to Generate Podcast ---
export const generatePodcastAudio = async (plainText, blogId) => {
  // Basic validation for input text
  if (!plainText) {
    console.warn(`Attempted to generate podcast for blog ${blogId} with empty text.`);
    throw new Error("Cannot generate podcast from empty text.");
  }

  // Choose a Neural voice compatible with the long-form engine.
  // See AWS Polly docs for available Neural voices in your region.
  const neuralVoiceId = "Ruth"; // Example: Joanna (en-US Neural voice)
  // 

  // Retrieve S3 bucket name from environment variables. Crucial for configuration.
  const outputS3BucketName = process.env.S3_BUCKET_NAME;
  if (!outputS3BucketName) {
    console.error("FATAL ERROR: S3_BUCKET_NAME is not defined in environment variables.");
    throw new Error("Server configuration error: Missing S3 bucket name.");
  }

  // Define the S3 key prefix where Polly will save the audio file.
  // Polly automatically appends the TaskId and .mp3 extension to this prefix.
  const outputS3KeyPrefix = `blog-${blogId}/audio`;

  // --- Parameters for the Polly Task ---
  const params = {
    OutputFormat: "mp3",
    Text: plainText,
    VoiceId: neuralVoiceId,   // Must be a Neural voice
    Engine: "long-form",      // Requires a Neural voice
    OutputS3BucketName: outputS3BucketName,
    OutputS3KeyPrefix: outputS3KeyPrefix,
    // Optional: Specify LanguageCode if needed, though often inferred from VoiceId
    // LanguageCode: "en-US",
    // Optional: Use an SNS topic to get notified when the task completes
    // SnsTopicArn: process.env.POLLY_SNS_TOPIC_ARN,
  };

  // Create the Polly command
  const command = new StartSpeechSynthesisTaskCommand(params);

  // --- Execute the Command with Error Handling ---
  try {
    // Send the command to AWS Polly to start the asynchronous task
    const response = await pollyClient.send(command);

    // Validate the response from Polly
    if (!response.SynthesisTask || !response.SynthesisTask.TaskId) {
        console.error("Invalid response received from Polly:", response);
        throw new Error("Polly did not return expected SynthesisTask information.");
    }

    console.log("Polly Synthesis Task Started successfully:", response.SynthesisTask);

    // --- Construct the Expected Public HTTPS URL ---
    // IMPORTANT: This relies on your S3 bucket having a policy that allows
    // public read access (s3:GetObject) to the files Polly creates.
    // The resource path in the policy should match: arn:aws:s3:::YOUR_BUCKET_NAME/blog-*/audio.*.mp3
    const taskId = response.SynthesisTask.TaskId;
    const region = process.env.AWS_REGION || 'us-east-1'; // Use the same region as the Polly client
    // Construct the standard S3 object URL format
    const expectedUrl = `https://${outputS3BucketName}.s3.${region}.amazonaws.com/${outputS3KeyPrefix}.${taskId}.mp3`;

    console.log("Constructed Podcast URL:", expectedUrl);
    return expectedUrl; // Return the anticipated public URL

  } catch (error) {
    // Log the detailed error from the AWS SDK
    console.error("AWS Polly Error (StartSpeechSynthesisTask):", error);

    // Create a more user-friendly error message based on the AWS error type
    let errorMessage = "Failed to start podcast generation.";
    if (error.name === 'ValidationException') {
        errorMessage = `Failed to start podcast generation due to invalid parameters: ${error.message}`;
    } else if (error.name === 'AccessDeniedException') {
        errorMessage = "Failed to start podcast generation. Check server permissions for AWS Polly and S3.";
    } else if (error.name === 'InvalidS3BucketException' || error.name === 'InvalidS3KeyException') {
        errorMessage = "Failed to start podcast generation. Check S3 bucket configuration on the server.";
    }
    // Add more specific error checks if needed based on Polly documentation

    // Throw the refined error to be caught by the route handler in podcastRouter.js
    throw new Error(errorMessage);
  }
};