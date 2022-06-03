const Feed = require("../models/Feed.model");
let Parser = require("rss-parser");
const News = require("../models/News.model");
let parser = new Parser();

const updateFeeds = async () => {
  //Pending possible optimisation: mapping all promises.
  const allFeeds = await Feed.find();

  allFeeds.forEach(async (source) => {
    let feed = await parser.parseURL(source.sourceUrl);
    let manyNews = [];

    feed.items.forEach(async (item) => {
      manyNews.push({
        content: item.content,
        feed: source._id,
        guid: item.guid,
        pubDate: item.pubDate
      });
    });

    try {
      const news = await News.insertMany(
        manyNews,
        { ordered: false },
        async function (error, docs) {
          let insertedDocs;
          if (error) insertedDocs = error.insertedDocs;
          else insertedDocs = docs;

          await Feed.findByIdAndUpdate(source._id, {
            $addToSet: { news: insertedDocs }, numberOfEntriesInXml: manyNews.length
          });
        }
      );
    } catch (error) {}
  });
};

module.exports = updateFeeds;
