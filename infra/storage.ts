// Create an S3 bucket with public read access
export const bucket = new sst.aws.Bucket("Uploads", {
  public: true,
  cors: {
    allowHeaders: ["*"],
    allowMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
    allowOrigins: ["*"],
    maxAge: "1 day",
  },
});

// Create the DynamoDB table
export const table = new sst.aws.Dynamo("Notes", {
  fields: {
    userId: "string",
    noteId: "string",
  },
  primaryIndex: { hashKey: "userId", rangeKey: "noteId" },
});
