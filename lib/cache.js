const createClient = require("@supabase/supabase-js").createClient;

const SUPERBASE_URL = "https://hxvrcsmgxjwegpueyssc.supabase.co";

const supabase = createClient(SUPERBASE_URL, process.env.SUPERBASE_KEY);

const checkForCache = async (url) => {
  try {
    let { data, error } = await supabase
      .from("meta-cache")
      .select("*")
      .eq("url", url);

    if (error) {
      console.log(error);
      return null;
    }

    if (data) {
      return data[0];
    }

    return null;
  } catch (err) {
    console.log(err);

    return null;
  }
};

const createCache = async (data) => {
  try {
    await supabase.from("meta-cache").insert(data);

    return true;
  } catch (err) {
    console.log(err);

    return false;
  }
};

exports.checkForCache = checkForCache;

exports.createCache = createCache;
