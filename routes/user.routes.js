const router = require("express").Router();
const UserModel = require("../models/User.model")
const FeedModel = require("../models/Feed.model")
const CommentModel = require("../models/Comment.model")
const NewsModel = require("../models/News.model")
const isAuthenticated = require("../middlewares/isAuthenticated")
const Parser = require('rss-parser')
//const isAuthenticated = require("../middlewares/isAuthenticated")

// gets all subscribed Feeds
router.get("/feed/",isAuthenticated, async (req, res, next) => {
    try {
        const response = await UserModel.findById(req.payload._id).select('subscribedFeeds').populate('subscribedFeeds.feed', 'name sourceUrl').lean()
        //.populate('subscribedFeeds.feed')
        // console.log("/feed/",response)
        // console.log("subscribed feed: ", response.subscribedFeeds)

        //console.log("get /feed/ subscribedFeeds", response.subscribedFeeds)
        res.json(response.subscribedFeeds)
    } catch (error) {
        next(error)
    }
})
//get allNews
router.get("/feed/all",isAuthenticated, async (req, res, next) => {
    try {
        //const response = await UserModel.findById(req.payload._id).select('subscribedFeeds').populate({path: 'subscribedFeeds.feed', populate: {path: 'news', model: 'News'}}).lean()
        //const response = await UserModel.findById(req.payload._id).select('subscribedFeeds').populate({path: 'subscribedFeeds._id', populate: {path: 'news', model: 'News'}}).lean()
        //.populate('subscribedFeeds.feed')
        //console.log("feed/all",response.subscribedFeeds)
        //res.json(response.subscribedFeeds)
        //const response = await UserModel.findById(req.payload._id).select('newsList').populate({path: 'newsList._id', model: 'News'})
        //const response = await UserModel.findById(req.payload._id).populate({path: 'newsList._id', model: 'News', populate : {path: 'comments', model: 'Comment', populate: {path: 'user', model: 'User'}}}).lean()
        const response = await UserModel.findById(req.payload._id)
        .select('newsList')
        .populate({
            path: 'newsList._id', model: 'News', 
            populate : {
                path: 'feed', model: 'Feed', 
                select: 'name sourceUrl'
            }})
        .populate({path: 'newsList._id', model: 'News', populate : {path: 'comments', model: 'Comment', populate: {path: 'user', model: 'User'}}})
        .lean()
        //temporal para arreglar fallo
        let result
            if(response.newsList && response.newsList.length > 0){
                result = response.newsList.filter(news=> news._id)
                result.sort(function(a,b){
                    return b._id.pubDate - a._id.pubDate
                })
            }
        else result = []
            
        res.json(result)
    } catch (error) {
        next(error)
    }
})

//get savedNews
router.get("/feed/favourites", isAuthenticated, async(req, res, next)=>{
    console.log("/feed/favourites")
    try {
        //const response = await UserModel.findById(req.payload._id).select('newsList').populate({path: 'subscribedFeeds._id', populate: {path: 'news', model: 'News'}}).lean()
        //const response = await UserModel.find({_id: req.payload._id, "newsList.favorite": true}, {'newsList.$': 1}).lean()
        //const response = await UserModel.findById(req.payload._id).select('newsList').populate({path: 'newsList._id', model: 'News'})//.populate({path: 'subscribedFeeds._id', populate: {path: 'news', model: 'News'}}).lean()
        //console.log(response)
        //const response = await UserModel.findById(req.payload._id).populate({path: 'newsList._id', model: 'News', populate : {path: 'comments', model: 'Comment', populate: {path: 'user', model: 'User'}}}).lean()
        const response = await UserModel.findById(req.payload._id)
        .select('newsList')
        .populate({
            path: 'newsList._id', model: 'News', 
            populate : {
                path: 'feed', model: 'Feed', 
                select: 'name sourceUrl'
            }})
        .populate({path: 'newsList._id', model: 'News', populate : {path: 'comments', model: 'Comment', populate: {path: 'user', model: 'User'}}})
        .lean()
        const result = response.newsList.filter(news=> news.favorite)
        result.sort(function(a,b){
            return b._id.pubDate - a._id.pubDate
        })
        res.json(result)
    } catch (error) {
        next(error)
    }
})

router.post("/feed/createOrFindAndSubscribe", isAuthenticated, async (req, res, next) => {
    const userID = req.payload._id
    const { name, sourceUrl, favicon } = req.body
    try {
        let newsArrayOfObjects = []
        let feed = await FeedModel.findOne({sourceUrl: sourceUrl})
        if (!feed) {
            let parser = new Parser()
            let parsedFeed = await parser.parseURL(sourceUrl)
            //feed = await FeedModel.create({name, sourceUrl})
            feed = await FeedModel.create({name: parsedFeed.title, sourceUrl})
        }//else añadir feed encontrado
        else await UserModel.findByIdAndUpdate(userID, {$addToSet: {subscribedFeeds: {_id: feed._id, feed: feed._id}}}).populate('subscribedFeeds._id')

        //else newsArrayOfObjects = feed.news.map((element)=>{return {'_id': element, 'feed': id}})
        newsArrayOfObjects = feed.news.map((element)=>{return {'_id': element._id, 'feed': element._id}})
        //we want to exclude duplicates EXCLUDEDUPLICATES
        let user = await UserModel.findById(userID).select('newsList').lean()
        if(user.newsList){
            let newsFromUser = user.newsList
            const userNewsIDs = new Set(newsFromUser.map(({_id})=>_id))
            const combined = [
                ...newsFromUser,
                newsArrayOfObjects.filter(({_id})=>!userNewsIDs.has(_id))
            ]
            //console.log("user.newsList:", user.newsList)
            //console.log("userNewsIDs",userNewsIDs.length)
            //await UserModel.findByIdAndUpdate(userID, {$addToSet: {subscribedFeeds: {_id: feed._id, feed: feed._id}}}).populate('subscribedFeeds._id')
            
            //if(userNewsIDs.length)await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: combined}}).populate('subscribedFeeds._id')
             await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: combined}}).populate('subscribedFeeds._id')
            }
            else await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: newsArrayOfObjects}}).populate('subscribedFeeds._id')

        //console.log(feed)
        res.json(feed)
    } catch (error) {
        next(error)
    }
})

router.get("/feed/sharedByUsers", isAuthenticated, async (req, res, next) =>{
    const userID = req.payload._id
    try {
        const feeds = await FeedModel.find({sharedBy: { $exists: true, $ne: []}}).select('name sourceUrl sharedBy')
        //console.log(feeds) 
        res.json(feeds)
    } catch (error) {
        next(error)
    }
    

})

router.post("feed/searchFeedSources", isAuthenticated, async (req, res, next) => {
    const { sourceUrl } = req.body



})





router.get("/feed/:id/subscribe", isAuthenticated, async (req, res, next) => {
    const { id } = req.params
    console.log("/feed/id/subs   id=", id)
    const userID = req.payload._id
    //const { userID } = req.body
    try {
        //we have to check that the user hasn't got the feed already, otherwise it will be duplicated due to Mongoose
        let user = await UserModel.findById(userID).select('newsList subscribedFeeds').lean()
        if (user.subscribedFeeds.some( e => String(e._id) === id)) console.log('duplicated')
        else await UserModel.findByIdAndUpdate(userID, {$addToSet: {subscribedFeeds: {_id: id, feed: id}}}).populate('subscribedFeeds._id')



        const news = await FeedModel.findById(id).select('news')
        newsArrayOfObjects = news.news.map((element)=>{return {'_id': element, 'feed': id}})
        console.log("arrayofobj:", newsArrayOfObjects)

        let response
        if(user.newsList){
            let newsFromUser = user.newsList
            const userNewsIDs = new Set(newsFromUser.map(({_id})=>_id))
            const combined = [
                ...newsFromUser,
                newsArrayOfObjects.filter(({_id})=>!userNewsIDs.has(_id))
            ]
            response = await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: combined}}).populate('subscribedFeeds._id')
        }
        else response = await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: newsArrayOfObjects}}).populate('subscribedFeeds._id')

        res.json(response)
    } catch (error) {
        next(error)
    }
})

// unsubscribe
router.get("/feed/:id/unsubscribe", isAuthenticated,async (req, res, next) => {
    const userID = req.payload._id
    const { id } = req.params
    //const { userID } = req.body
    try {
        const response = await UserModel.findByIdAndUpdate(userID, {$pull: {subscribedFeeds: {_id: id}}}).populate('subscribedFeeds._id')

        res.json(response)
    } catch (error) {
        next(error)
    }
})

// share feed
router.get("/feed/:id/share", isAuthenticated, async (req, res, next) => {
    const { id } = req.params
    const userID = req.payload._id
    try {
        const user = await UserModel.findOneAndUpdate(
            {
                _id: userID,
                "subscribedFeeds._id": id,
              },
              {
                  $set: {
                      'subscribedFeeds.$.shared': true
                  }
              }
        )
        const response = await FeedModel.findByIdAndUpdate(id, {$addToSet: {sharedBy: userID}})

        res.json(response)
    } catch (error) {
        next(error)
    }
})
//unshare feed
router.get("/feed/:id/unshare", isAuthenticated,async (req, res, next) => {
    const { id } = req.params
    const userID = req.payload._id
    try {
        const user = await UserModel.findOneAndUpdate(
            {
                _id: userID,
                "subscribedFeeds._id": id,
              },
              {
                  $set: {
                      'subscribedFeeds.$.shared': false
                  }
              }
        )
        const response = await FeedModel.findByIdAndUpdate(id, {$pull: {sharedBy: userID}})

        res.json(response)
    } catch (error) {
        next(error)
    }
})
//returns the name of a feed
router.get("/feed/:id/name", isAuthenticated, async (req, res, next) => {
    const {id} = req.params
    try {
        const response = await FeedModel.findById(id).select('name')
        //console.log(response)
        res.json(response)
    } catch (error) {
        
    }
})


//gets a feed with all news
router.get("/feed/:id", isAuthenticated, async (req, res, next) => {
    const { id } = req.params
    const userID = req.payload._id
    //const { userID } = req.body
    try {
        //https://www.spektor.dev/filtering-values-in-nested-arrays-mongodb/

        // const response = await UserModel.findById(req.payload._id)
        // .select('newsList')
        // .populate({path: 'newsList._id', model: 'News', populate : {path: 'comments', model: 'Comment', populate: {path: 'user', model: 'User'}}}).lean()
        
        const response = await UserModel.findById(req.payload._id)
        .select('newsList')
        .populate({
            path: 'newsList._id', model: 'News', 
            populate : {
                path: 'feed', model: 'Feed', 
                select: 'name sourceUrl'
            }})
        .populate({path: 'newsList._id', model: 'News', populate : {path: 'comments', model: 'Comment', populate: {path: 'user', model: 'User'}}})
        .lean()
        
        // const result = response.newsList.filter(news=> news._id && String(news._id.feed)===id)
        const filteredResponse = response.newsList.filter(news=> news._id && String(news._id.feed._id)===id)
        filteredResponse.sort(function(a,b){
            return b._id.pubDate - a._id.pubDate
        })
        //console.log(response.newsList)
        res.json(filteredResponse)
    } catch (error) {
        next(error)
    }
})

//refresh news route
router.get("/news/refresh", isAuthenticated,async (req, res, next) => {
    const userID = req.payload._id
    try {
        
        const subscriptions = await UserModel.findById(userID).select('subscribedFeeds').lean()
        let newNews = []
        //console.log("subscriptions", subscriptions)
        if(subscriptions.subscribedFeeds && subscriptions.subscribedFeeds.length > 0){
            subscriptions.subscribedFeeds.forEach(async (subscription) => {
                const news = await FeedModel.findById(subscription._id).select('news').lean()
                const newsArrayOfObjects = news.news.map((element)=>{return {'_id': element}})
                //await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: newsArrayOfObjects}}).populate('subscribedFeeds._id')

                let user = await UserModel.findById(userID).select('newsList').lean()
                //WE HAVE TO SKIP THE PROCESS IF NEWSLIST IS EMPTY
                //console.log("USER.NEWSLIST", user.newsList)
                if(user.newsList){
                    
                    let newsFromUser = user.newsList
                    const userNewsIDs = new Set(newsFromUser.map(({_id})=>_id))
                    const filteredNews = newsArrayOfObjects.filter(({_id})=>!userNewsIDs.has(_id))
                    // const combined = [
                    //     ...newsFromUser,
                    //     filteredNews
                    // ]
                    
                    //if(userNewsIDs.length)await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: combined}}).populate('subscribedFeeds._id')
                    console.log("we add from", subscription._id, "combined: ", combined.length, "newsArr: ", newsArrayOfObjects.length)
                    console.log(newsArrayOfObjects)
                    console.log(combined)
                    const test = await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: filteredNews}}).populate('subscribedFeeds._id')
                    //console.log(test)
                }
                else{
                    await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: newsArrayOfObjects}}).populate('subscribedFeeds._id')
                } 
            })
        }
        //const news = await FeedModel.findById(id).select('news')
        
        //console.log("arrayofobj:", newsArrayOfObjects)
        //const response = await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: newsArrayOfObjects}}).populate('subscribedFeeds._id')
        
        //const test = await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: {}}})
        //.populate('subscribedFeeds.feed', 'name')

        res.json("Refreshed")
    } catch (error) {
        next(error)
    }

})
//mark All as read
router.get("/:userID/news/markAllAsRead", async (req, res, next) => {
    const { userID, feedId } = req.params
    //const { userID } = req.body
    try {
        const user = await UserModel.findOneAndUpdate(
            {
                _id: userID,
                "newsList.seed": false
              },
              {
                  $set: {
                      'newsList.$[elem].seen': true
                  }
              },
              { "arrayFilters": [{ "elem.seen": false }], "multi": true }
        )
        res.json(user)
    } catch (error) {
        next(error)
    }
})

//mark All as read
router.get("/:userID/news/:feedId/markAllAsRead", async (req, res, next) => {
    const { userID, feedId } = req.params
    //const { userID } = req.body
    try {
        const user = await UserModel.findOneAndUpdate(
            {
                _id: userID,
                // "newsList.seen": false,
                // "newsList.feed": feedId
              },
              {
                  $set: {
                      'newsList.$[elem].seen': true
                  }
              },
              { "arrayFilters": [{ "elem.seen": false, "elem.feed": feedId }], "multi": true }
        )
        res.json(user)
    } catch (error) {
        next(error)
    }
})

//mark as read
router.get("/news/:id/markAsRead", isAuthenticated,async (req, res, next) => {
    const { id } = req.params
    const userID = req.payload._id
    //const { userID } = req.body
    try {
        const user = await UserModel.findOneAndUpdate(
            {
                _id: userID,
                "newsList._id": id,
              },
              {
                  $set: {
                      'newsList.$.seen': true
                  }
              }
        )

        res.json(user)
    } catch (error) {
        next(error)
    }
})

//mark as favourite
router.get("/news/:id/markAsFavourite", isAuthenticated,async (req, res, next) => {
    const { id } = req.params
    const userID = req.payload._id
    try {
        const user = await UserModel.findOneAndUpdate(
            {
                _id: userID,
                "newsList._id": id,
              },
              {
                  $set: {
                      'newsList.$.favorite': true
                  }
              }
              
        )

        res.json(user)
    } catch (error) {
        next(error)
    }
})

//unmark as favourite
router.get("/news/:id/unmarkAsFavourite", isAuthenticated,async (req, res, next) => {
    const { id } = req.params
    const userID = req.payload._id
    try {
        const user = await UserModel.findOneAndUpdate(
            {
                _id: userID,
                "newsList._id": id,
              },
              {
                  $set: {
                      'newsList.$.favorite': false
                  }
              }
              
        )

        res.json(user)
    } catch (error) {
        next(error)
    }
})


//get favourites



//POST /api/user/629b627a0abde8d1ae128aad/news/629b9a562a21411d62a08079/comment
router.post("/news/:id/comment", isAuthenticated, async (req, res, next) => {
    const { id } = req.params
    const userID = req.payload._id
    const { comment } = req.body
    console.log(userID, id, comment)
    try {
        const myComment = await CommentModel.create({user: userID, news: id, comment: comment})
        const user = await UserModel.findByIdAndUpdate(userID, {$addToSet: {comments: myComment._id}})
        const feed = await NewsModel.findByIdAndUpdate(id, {$addToSet: {comments: myComment._id}})
        
        console.log("myComment: ", myComment)
        res.json(myComment)
    } catch (error) {
        next(error)
    }
})

//edit comment route
router.post("/:userID/comments/:id/edit", async (req, res, next) => {
    const { userID, id } = req.params
    const { comment } = req.body
    console.log(userID, id, comment)
    try {
        const myComment = await CommentModel.findOneAndUpdate({_id: id, user:userID}, {comment: comment})
        res.json(myComment)
    } catch (error) {
        next(error)
    }
})

//delete comment route
router.delete("/comments/:id", isAuthenticated,async (req, res, next) => {
    const { id } = req.params
    const userID = req.payload._id
    try {
        const myComment = await CommentModel.findOneAndDelete({_id: id, user: userID}).populate('news')
        const user = await UserModel.findByIdAndUpdate(userID, {$pull: {comments: myComment._id}})
        const news = await NewsModel.findByIdAndUpdate(myComment.news._id, {$pull: {comments: myComment._id}})

        res.json(myComment)
    } catch (error) {
        next(error)
    }
})


//profile

//remember password

//upload image

//change name/nickname

module.exports = router;