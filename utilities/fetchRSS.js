const Feed = require("../models/Feed.model");
//https://www.npmjs.com/package/rss-parser
let Parser = require ('rss-parser');
const News = require("../models/News.model");
let parser = new Parser();

const updateFeeds = async () =>{
    //Pending optimisation: mapping all promises.
    const allFeeds = await Feed.find()
    allFeeds.forEach(async (source) => {

        let feed = await parser.parseURL(source.sourceUrl);
        let manyNews = []
        feed.items.forEach(async (item) =>{
            //console.log(item.guid +':' + item.title + ':' + item.link)
            //console.log(item.content)
            //Here we should add the item to our Feed news model
            //We have 2 possibilities:
            //https://www.educative.io/edpresso/how-to-create-one-or-many-documents-at-once-in-mongoose
            manyNews.push({content: item.content, feed: source._id, guid: item.guid})
            //1. Our Feed object, search if Items exist in the Array, and Add them

            //2. Our News object, just create a new entry with the ID of our feed
            //await News.create({content: item.content, feed: source._id, guid: item.guid})
            const existsNews = await Feed.findOne(
                {
                    _id: source._id,
                    "news.guid": item.guid
                }
            )
            //console.log("existsNews:", existsNews)
            //if(existsNews===null)
            source.news.push({content: item.content, feed: source._id, guid: item.guid})

        })
        source.save(function(err, result){
            if(err) console.log(err)
            else console.log(result)
        })

        try {
            //await News.create(manyNews)
        } catch (error) {
            console.log("Something", error)
        }
        
    })
}


module.exports = updateFeeds;