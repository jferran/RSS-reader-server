const router = require("express").Router();

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

const authRoutes = require('./auth.routes')
router.use('/auth', authRoutes)

const feedRoutes = require('./feed.routes')
router.use('/feed', feedRoutes)

const newsRoutes = require('./news.routes')
router.use('/news', newsRoutes)

module.exports = router;
