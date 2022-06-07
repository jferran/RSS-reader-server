const router = require("express").Router();
const UserModel = require("../models/User.model")
const FeedModel = require("../models/Feed.model")
const CommentModel = require("../models/Comment.model")
const NewsModel = require("../models/News.model")
const isAuthenticated = require("../middlewares/isAuthenticated")
//const isAuthenticated = require("../middlewares/isAuthenticated")

// gets all subscribed Feeds
router.get("/feed/",isAuthenticated, async (req, res, next) => {
    try {
        const response = await UserModel.findById(req.payload._id).select('subscribedFeeds').populate('subscribedFeeds.feed', 'name').lean()
        //.populate('subscribedFeeds.feed')
        console.log("/feed/",response)
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
        const response = await UserModel.findById(req.payload._id).select('newsList').populate({path: 'newsList._id', model: 'News'})
        //temporal para arreglar fallo
        const result = response.newsList.filter(news=> news._id)

        //console.log(result)
        //res.json(response.newsList)
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
        const response = await UserModel.findById(req.payload._id).select('newsList').populate({path: 'newsList._id', model: 'News'})//.populate({path: 'subscribedFeeds._id', populate: {path: 'news', model: 'News'}}).lean()
        //const response = await UserModel.find({_id: req.payload._id, "newsList.favorite": true}, {'newsList.$': 1}).lean()
        console.log(response)
        const result = response.newsList.filter(news=> news.favorite)
        console.log(result)
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
        let feed = await FeedModel.findOne({sourceUrl: sourceUrl}).select('news')
        if (!feed) {
            feed = await FeedModel.create({name, sourceUrl})
        }//else newsArrayOfObjects = feed.news.map((element)=>{return {'_id': element, 'feed': id}})
        newsArrayOfObjects = feed.news.map((element)=>{return {'_id': element._id, 'feed': element._id}})
        await UserModel.findByIdAndUpdate(userID, {$addToSet: {subscribedFeeds: {_id: feed._id, feed: feed._id}}}).populate('subscribedFeeds._id')
        await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: newsArrayOfObjects}}).populate('subscribedFeeds._id')
        //await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: newsArrayOfObjects}}).populate('subscribedFeeds._id')
        res.json("subscribed")
    } catch (error) {
        next(error)
    }
})






router.get("/:userID/feed/:id/subscribe", async (req, res, next) => {
    const { userID, id } = req.params
    //const { userID } = req.body
    try {
        const news = await FeedModel.findById(id).select('news')
        newsArrayOfObjects = news.news.map((element)=>{return {'_id': element, 'feed': id}})
        console.log("arrayofobj:", newsArrayOfObjects)

        //not working in one line, so we make 2 queries
        //const response = await UserModel.findByIdAndUpdate(userID, {$addToSet: {subscribedFeeds: {_id: id, feed: id, newsList: newsArrayOfObjects}}).populate('subscribedFeeds._id')
        const response = await UserModel.findByIdAndUpdate(userID, {$addToSet: {subscribedFeeds: {_id: id, feed: id}}}).populate('subscribedFeeds._id')
        const response2 = await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: newsArrayOfObjects}}).populate('subscribedFeeds._id')
        //.populate('subscribedFeeds.feed', 'name')

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

//gets a feed with all news
router.get("/feed/:id", isAuthenticated, async (req, res, next) => {
    const { id } = req.params
    const userID = req.payload._id
    //const { userID } = req.body
    try {
        //https://www.spektor.dev/filtering-values-in-nested-arrays-mongodb/

        //const news = await FeedModel.findById(id).select('news')


        //const response = await UserModel.findById(userID, {subscribedFeeds: {$elemMatch: {feed: id}}, projection:{subscribedFeeds: 1}}).populate('subscribedFeeds.feed').lean()

        //const response = await UserModel.findById(userID, {subscribedFeeds: {$elemMatch: {feed: id}}, projection:{subscribedFeeds: 1}}).populate('subscribedFeeds.feed').lean()
        const response2 = await UserModel.findById(userID, {subscribedFeeds: {$elemMatch: {feed: id}}}).populate({path: 'subscribedFeeds._id', populate: {path: 'news', model: 'News'}}).lean()
        //this is wrong. We want our news
        //const response = await UserModel.findById(userID, {subscribedFeeds: {$elemMatch: {feed: id}}}).populate({path: 'subscribedFeeds._id', populate: {path: 'news', model: 'News'}}).lean()

        //const test = await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: {entry: id}}})
        //const response = await UserModel.findById(userID, 'subscribedFeeds.feed').populate('subscribedFeeds.feed')
        //const response = await UserModel.findById(userID).select('subscribedFeeds')
        //const response = await UserModel.findById(userID, {projection: {subscribedFeeds: 1}})
        

        //.populate('subscribedFeeds.feed', 'name')
        //.projection({{"subscribedFeeds.feed": '62994d4685afac2e514a3777'}})
        //console.log(response.subscribedFeeds[0])
        //res.json(response.subscribedFeeds[0].feed)
        //works
        //res.json(response.subscribedFeeds[0])

        //res.json(response.subscribedFeeds[0])
        //const response = await UserModel.findById(req.payload._id).populate({path: 'newsList._id', model: 'News'}).lean()
        const response = await UserModel.findById(req.payload._id).populate({path: 'newsList._id', model: 'News', populate : {path: 'comments', model: 'Comment', populate: {path: 'user', model: 'User'}}}).lean()
        //console.log(response)
        //res.json(response)
        //const result = response.newsList.filter(news=> String(news._id.feed) === id)
        //response.newsList.forEach((element) => console.log(String(element._id.feed) === id))
        //console.log(result)
        const result = response.newsList.filter(news=> news._id && String(news._id.feed)===id)
        console.log(result)
        res.json(result)
    } catch (error) {
        next(error)
    }
})

//refresh news route
router.get("/:userID/news/refresh", async (req, res, next) => {
    const { userID } = req.params
    try {
        
        const subscriptions = await UserModel.findById(userID).select('subscribedFeeds').lean()
        let newNews = []
        console.log("subscriptions", subscriptions)
        subscriptions.subscribedFeeds.forEach(async (subscription) => {
            const news = await FeedModel.findById(subscription._id).select('news').lean()
            const newsArrayOfObjects = news.news.map((element)=>{return {'_id': element}})
            await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: newsArrayOfObjects}}).populate('subscribedFeeds._id')
        })
        
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
router.get("/:userID/news/:id/markAsRead", async (req, res, next) => {
    const { userID, id } = req.params
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
        
        
        res.json("comment posted")
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
router.delete("/:userID/comments/:id", async (req, res, next) => {
    const { userID, id } = req.params
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