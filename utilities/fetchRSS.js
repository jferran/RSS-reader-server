const Feed = require("../models/Feed.model");
let Parser = require ('rss-parser')
let parser = new Parser();

const updateFeeds = async () =>{
    const allFeeds = await Feed.find()
    allFeeds.forEach(async (source) => {

        let feed = await parser.parseURL(source.sourceUrl);

        feed.items.forEach(item =>{
            console.log(item.guid +':' + item.title + ':' + item.link)
        })
    })
}


module.exports = updateFeeds;