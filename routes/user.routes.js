const router = require("express").Router();
const UserModel = require("../models/User.model")
const FeedModel = require("../models/Feed.model")
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
        newsArrayOfObjects = news.news.map((element)=>{return {'_id': element}})
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
router.get("/userID/news/:id/markAsFavourite"), async (req, res, next) => {
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
}





//comment route
router.get("/userID/news/:id/comment"), async (req, res, next) => {
    try {
        
    } catch (error) {
        
    }
}


module.exports = router;