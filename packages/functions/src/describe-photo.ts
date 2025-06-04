import * as uuid from "uuid";
import { Resource } from "sst";
import { Util } from "@notes/core/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const bedrockClient = new BedrockRuntimeClient({});
const s3Client = new S3Client({});

export const main = Util.handler(async (event) => {
  console.log("Event received:", JSON.stringify(event, null, 2));

  if (!event.body) {
    throw new Error("No body provided");
  }

  // Parse the request body which should contain base64 image data
  const data = JSON.parse(event.body);
  const { image, filename, contentType } = data;

  if (!image) {
    throw new Error("No image provided");
  }

  // Generate unique filename
  const imageKey = `photos/${uuid.v1()}-${filename || 'photo.jpg'}`;
  
  // Convert base64 to buffer
  const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');

  // Upload to S3
  const uploadParams = {
    Bucket: Resource.Uploads.name,
    Key: imageKey,
    Body: imageBuffer,
    ContentType: contentType || 'image/jpeg',
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  console.log("Image uploaded to S3:", imageKey);

  // Construct the public S3 URL
  const imageUrl = `https://${Resource.Uploads.name}.s3.amazonaws.com/${imageKey}`;
  console.log("Generated image URL:", imageUrl);

  // Send image to Bedrock for AI description
  const prompt = "Describe this image in detail for alt text. Be specific about objects, people, colors, and setting. Keep it concise but descriptive.";

  // Claude 3.7 Sonnet format (different from Nova format)
  const modelInput = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 300,
    temperature: 0.1,
    top_p: 0.9,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: contentType?.includes('png') ? 'image/png' : 'image/jpeg',
              data: image.replace(/^data:image\/\w+;base64,/, ''),
            },
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  };

  const modelCmd = new InvokeModelCommand({
    modelId: "anthropic.claude-3-7-sonnet-20250219-v1:0",
    body: JSON.stringify(modelInput),
  });

  console.log("Sending request to Claude 3.7 Sonnet...");
  const bedrockResponse = await bedrockClient.send(modelCmd);
  
  // Convert Bedrock response buffer to string
  const jsonRes = Buffer.from(bedrockResponse.body).toString("utf8");
  const parsedResponse = JSON.parse(jsonRes);
  
  // Claude response format: content array with text
  const aiDescription = parsedResponse.content[0].text;
  console.log("AI Description:", aiDescription);

  // Save to DynamoDB
  const dbParams = {
    TableName: Resource.Notes.name,
    Item: {
      userId: "anonymous-user",
      noteId: uuid.v1(),
      content: `📸 AI Photo Description: ${aiDescription}`,
      attachment: imageKey,
      aiDescription: aiDescription,
      imageUrl: imageUrl,
      createdAt: Date.now(),
      usage: parsedResponse.usage,
    },
  };

  await dynamoDb.send(new PutCommand(dbParams));
  console.log("Saved to DynamoDB");

  // Return JSON string as expected by Util.handler
  return JSON.stringify({
    success: true,
    description: aiDescription,
    imageUrl: imageUrl,
    note: dbParams.Item,
    usage: parsedResponse.usage,
  });
}); 