/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "live-2025-workshop",
      removal: "remove",
      home: "aws",
    };
  },
  async run() {
    await import("./infra/api");
    await import("./infra/web");
    await import("./infra/storage");

    return {
      Region: aws.getRegionOutput().name,
    };
  },
});
