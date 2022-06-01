const Feed = require("../models/Feed.model");
const updateFeeds = require("../utilities/fetchRSS")
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
        const response = await Feed.findById(id)

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