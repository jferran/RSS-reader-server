const router = require("express").Router();
const UserModel = require("../models/User.model")
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
        const response = await UserModel.findById(userID, {subscribedFeeds: {$elemMatch: {feed: id}}, projection:{subscribedFeeds: 1}}).populate('subscribedFeeds.feed').lean()
        const test = await UserModel.findByIdAndUpdate(userID, {$addToSet: {newsList: {entry: id}}})
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
        //const response = await UserModel.findByIdAndUpdate(userID, {$addToSet: {subscribedFeeds: {feed: id}}}).populate('subscribedFeeds.feed')
        //const response = await UserModel.findByIdAndUpdate(userID, {$addToSet: {subscribedFeeds: {_id: id, feed: id}}}).populate('subscribedFeeds.feed')
        const response = await UserModel.findByIdAndUpdate(userID, {$addToSet: {subscribedFeeds: {_id: id, feed: id}}}).populate('subscribedFeeds._id')
        //.populate('subscribedFeeds.feed', 'name')

        res.json(response)
    } catch (error) {
        next(error)
    }
})



module.exports = router;