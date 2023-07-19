require("dotenv").config();
const express = require("express");
const createClient = require("redis").createClient;
const { checkForCache, createCache } = require("./lib/cache");
const { getMetadata, urlRegex, convertToFullUrl } = require("./lib");

const app = express();

const port = 8080;

// if (process.env.REDIS_URL) {
//   var redis = createClient({
//     password: process.env.REDIS_PASSWORD,
//     socket: {
//       host: process.env.REDIS_URL,
//       port: process.env.REDIS_PORT,
//     },
//   });
// }

// const limiter = require("express-limiter")(app, redis);

// limiter({
//   path: "/api/v2/metadata",
//   method: "get",
//   lookup: ["connection.remoteAddress"],
//   // 300 requests per minute
//   total: 300,
//   expire: 1000 * 60,
// });

const sendResponse = (res, output) => {
  if (!output) {
    return res
      .set("Access-Control-Allow-Origin", "*")
      .status(404)
      .json({ metadata: null });
  }

  return res
    .set("Access-Control-Allow-Origin", "*")
    .status(200)
    .json({ metadata: output });
};

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

app.get("/", (req, res) => {
  return res
    .set("Access-Control-Allow-Origin", "*")
    .status(200)
    .json({ message: "Welcome to the metadata API" });
});

app.get("/api/v1/metadata", async (req, res) => {
  const url = req.query.url;

  const metadata = await getMetadata(url);

  return res
    .set("Access-Control-Allow-Origin", "*")
    .status(200)
    .json({ metadata });
});

app.get("/api/v2/metadata", async (req, res) => {
  try {
    let url = req.query.url;

    if (!url) {
      console.log("76");
      return res
        .set("Access-Control-Allow-Origin", "*")
        .status(400)
        .json({ error: "Invalid Url" });
    }

    url = convertToFullUrl(url);

    console.log(url);

    const isValidUrl = urlRegex.test(url);

    if (!url || !isValidUrl) {
      console.log("90");
      return res
        .set("Access-Control-Allow-Origin", "*")
        .status(400)
        .json({ error: "Invalid URL" });
    }

    if (url && isValidUrl) {
      const { hostname } = new URL(url);

      let output;

      const cached = await checkForCache(url);

      if (cached) {
        return res
          .set("Access-Control-Allow-Origin", "*")
          .status(200)
          .json({ metadata: cached });
      }

      const metadata = await getMetadata(url);

      if (!metadata) {
        return sendResponse(res, null);
      }

      const { images, og, meta } = metadata;

      let image = og?.image
        ? og?.image
        : images?.length > 0
        ? images?.[0].src
        : null;

      const description = og?.description
        ? og?.description
        : meta?.description
        ? meta?.description
        : null;

      const title = (og?.title ? og?.title : meta?.title) || "";

      const siteName = og?.site_name || "";

      output = {
        title,
        description,
        image,
        siteName,
        hostname,
      };

      sendResponse(res, output);

      if (!cached && output) {
        await createCache({
          url,
          title: output.title,
          description: output.description,
          image: output.image,
          siteName: output.siteName,
          hostname: output.hostname,
        });
      }
    }
  } catch (err) {
    console.log(err);

    return res.set("Access-Control-Allow-Origin", "*").status(500).json({
      error: "Something went wrong. Please try again later.",
    });
  }
});
