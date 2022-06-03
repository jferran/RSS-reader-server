const Feed = require("../models/Feed.model");
//https://www.npmjs.com/package/rss-parser
let Parser = require ('rss-parser');
const News = require("../models/News.model");
let parser = new Parser();

// const updateFeeds = async () =>{
//     //Pending optimisation: mapping all promises.
//     const allFeeds = await Feed.find()
    
//     allFeeds.forEach(async (source) => {

//         let feed = await parser.parseURL(source.sourceUrl);
//         let manyNews = []
//         feed.items.forEach(async (item) =>{
//             //Here we should add the item to our Feed news model
//             //We have 2 possibilities:
//             //https://www.educative.io/edpresso/how-to-create-one-or-many-documents-at-once-in-mongoose
//             manyNews.push({content: item.content, feed: source._id, guid: item.guid})
//             //1. Our Feed object, search if Items exist in the Array, and Add them

//             //2. Our News object, just create a new entry with the ID of our feed
//             //await News.create({content: item.content, feed: source._id, guid: item.guid})
//             const existsNews = await Feed.findOne(
//                 {
//                     _id: source._id,
//                     "news.guid": item.guid
//                 }
//             )
            
//             //if(existsNews===null)
//             source.news.push({content: item.content, feed: source._id, guid: item.guid})
//             source.markModified('news')

//             source.news.update()

//         })
//         source.insertMany(manyNews)
//         await source.save(function(err, result){
//             if(err) {
//                 console.log(err)
//                 return
//             }
//             else console.log("NO ERROR!",result)
//         })

//         try {
//             //await News.create(manyNews)
//         } catch (error) {
//             console.log("Something", error)
//         }
        
//     })
// }


const updateFeeds = async () =>{
    //Pending optimisation: mapping all promises.
    const allFeeds = await Feed.find()
    
    allFeeds.forEach(async (source) => {

        let feed = await parser.parseURL(source.sourceUrl);
        let manyNews = []
        feed.items.forEach(async (item) =>{
            //Here we should add the item to our Feed news model
            //We have 2 possibilities:
            //https://www.educative.io/edpresso/how-to-create-one-or-many-documents-at-once-in-mongoose
            manyNews.push({content: item.content, feed: source._id, guid: item.guid})
            //1. Our Feed object, search if Items exist in the Array, and Add them

            //2. Our News object, just create a new entry with the ID of our feed
            //await News.create({content: item.content, feed: source._id, guid: item.guid})
           
            source.news.push({content: item.content, feed: source._id, guid: item.guid})
            source.markModified('news')

            

        })
        //https://medium.com/@tayomadein/mongodbs-addtoset-operator-using-mongo-shell-and-mongoose-odm-3edebf2bfd13
        await Feed.findByIdAndUpdate(
            source._id, {$addToSet: {news: manyNews}}
            )
        // await source.update(
        //     {$push: {news: manyNews}}
        // )

    })
}

module.exports = updateFeeds;