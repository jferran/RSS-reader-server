const Feed = require("../models/Feed.model");
const updateFeeds = require("../utilities/updateFeeds")
const router = require("express").Router();
//const isAuthenticated = require("../middlewares/isAuthenticated")

router.get("/", async (req, res, next) =>{
    try {
        const response = await Feed.find()
        updateFeeds()
        res.json(response)
    } catch (error) {
        next(error)
    }
})

router.post("/", async (req, res, next) => {
    const { name, sourceUrl } = req.body
    console.log("name: ", name, "sourceUrl: ", sourceUrl)
    try {
        const response = await Feed.create({name, sourceUrl})
        res.json(response)
    } catch (error) {
        next(error)
    }
})

router.get("/:id", async (req, res, next) => {
    const { id } = req.params
    try {
        const response = await Feed.findById(id).populate('news')
        //const response = await Feed.findById(id).populate('news._id')//.explain()

        res.json(response)
    } catch (error) {
        next(error)
    }
})

router.delete("/:id", async (req, res, next) => {
    const {id} = req.params
    try {
        await Feed.findByIdAndDelete(id)
        res.json("Feed was deleted") 
    } catch (error) {
        next(error)        
    }
})



module.exports = router;