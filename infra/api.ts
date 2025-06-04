import { table, bucket } from "./storage";

// Create the API
export const api = new sst.aws.ApiGatewayV2("Api", {
  transform: {
    route: {
      handler: {
        link: [table, bucket],
        permissions: [
          {
            actions: ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
            resources: ["arn:aws:bedrock:*::foundation-model/anthropic.claude-3-7-sonnet-20250219-v1:0"],
          },
        ],
      },
    }
  },
  domain: {
    name: "live.patternsatscale.com"
  }
});

api.route("GET /notes", "packages/functions/src/list.main");
api.route("POST /notes", "packages/functions/src/create.main");
api.route("GET /notes/{id}", "packages/functions/src/get.main");
api.route("PUT /notes/{id}", "packages/functions/src/update.main");
api.route("DELETE /notes/{id}", "packages/functions/src/delete.main");

// New photo description endpoint
api.route("POST /describe-photo", "packages/functions/src/describe-photo.main");
