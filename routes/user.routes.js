const router = require("express").Router();
const UserModel = require("../models/User.model")
const FeedModel = require("../models/Feed.model")
const CommentModel = require("../models/Comment.model")
const NewsModel = require("../models/News.model")
//const isAuthenticated = require("../middlewares/isAuthenticated")

// gets all subscribed Feeds
router.get("/:userID/feed/", async (req, res, next) => {
    const { userID, id } = req.params
    //const { userID } = req.body
    try {
        const response = await UserModel.findById(userID).populate('subscribedFeeds.feed', 'name')
        //.populate('subscribedFeeds.feed')

        res.json(response)
    } catch (error) {
        next(error)
    }
})

//gets a feed with all news
router.get("/:userID/feed/:id", async (req, res, next) => {
    const { userID, id } = req.params
    //const { userID } = req.body
    try {
        //https://www.spektor.dev/filtering-values-in-nested-arrays-mongodb/

        const news = await FeedModel.findById(id).select('news')

        const response = await UserModel.findById(userID, {subscribedFeeds: {$elemMatch: {feed: id}}, projection:{subscribedFeeds: 1}}).populate('subscribedFeeds.feed').lean()
        //const test = await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: {entry: id}}})
        //const response = await UserModel.findById(userID, 'subscribedFeeds.feed').populate('subscribedFeeds.feed')
        //const response = await UserModel.findById(userID).select('subscribedFeeds')
        //const response = await UserModel.findById(userID, {projection: {subscribedFeeds: 1}})


        //.populate('subscribedFeeds.feed', 'name')
        //.projection({{"subscribedFeeds.feed": '62994d4685afac2e514a3777'}})
        console.log(response)
        res.json(response.subscribedFeeds[0].feed)
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
        //console.log("arrayofobj:", newsArrayOfObjects)

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
router.get("/:userID/feed/:id/unsubscribe", async (req, res, next) => {
    const { userID, id } = req.params
    //const { userID } = req.body
    try {
        const response = await UserModel.findByIdAndUpdate(userID, {$pull: {subscribedFeeds: {_id: id}}}).populate('subscribedFeeds._id')

        res.json(response)
    } catch (error) {
        next(error)
    }
})

// share feed
router.get("/:userID/feed/:id/share", async (req, res, next) => {
    const { userID, id } = req.params
    //const { userID } = req.body
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
router.get("/:userID/feed/:id/unshare", async (req, res, next) => {
    const { userID, id } = req.params
    //const { userID } = req.body
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
router.get("/:userID/news/:id/markAsFavourite", async (req, res, next) => {
    const { userID, id } = req.params
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



//POST /api/user/629b627a0abde8d1ae128aad/news/629b9a562a21411d62a08079/comment
router.post("/:userID/news/:id/comment", async (req, res, next) => {
    const { userID, id } = req.params
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
router.post("/userID/news/:id/comment/edit", async (req, res, next) => {
    try {
        
    } catch (error) {
        
    }
})

//delete comment route
router.get("/userID/news/:id/comment/delete", async (req, res, next) => {
    try {
        
    } catch (error) {
        
    }
})


module.exports = router;