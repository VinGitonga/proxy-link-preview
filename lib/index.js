const { parser } = require("html-metadata-parser");

const config = {
  headers: {
    "Accept-Encoding": "gzip,deflate,br",
  },
};

const getMetadata = async (url) => {
  try {
    const result = await parser(url, config);

    return result;
  } catch (err) {
    console.log(err);

    return null;
  }
};

const convertToFullUrl = (url) => {
  if (!/^https?:\/\//i.test(url)) {
    url = "http://" + url;
  }

  return url;
};

const urlRegex =
  /^(?:(?:https?|ftp):\/\/)?(?:www\.)?((?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(?:\/([^\s?#]+))?(?:\?([^\s#]+))?(?:#([^\s]+))?$/;

exports.getMetadata = getMetadata;
exports.convertToFullUrl = convertToFullUrl;
exports.urlRegex = urlRegex;
