const { default: axios } = require("axios");
const cheerio = require("cheerio");
//const { JSDOM } = require("jsdom");
const url = require('url');
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
    const { name, sourceUrl, favicon } = req.body
    console.log("name: ", name, "sourceUrl: ", sourceUrl)
    try {
        const response = await Feed.create({name, sourceUrl, favicon})
        res.json(response)
    } catch (error) {
        next(error)
    }
})

router.post("/searchFeedSources", async (req, res, next) => {
    const { sourceUrl } = req.body
    

    const setHttp = (link) =>{
        if (link.search(/^http[s]?\:\/\//) == -1) {
            link = 'https://' + link;
        }
        return link;
    }

    

    try {
        const urlWithProtocol = setHttp(sourceUrl)
        let htmlString = (await axios.get(urlWithProtocol)).data
        
        let response = []//{ source: urlWithProtocol }
        let $ = cheerio.load(htmlString)
        
        let title
        if($("body").children(":first").prop("tagName") === 'RSS'){
            //We have an RSS file,
            title = $("title:first").text().replace("<![CDATA[", "").replace("]]>", "")
            response[0] = {'title': title, 'url': urlWithProtocol}
        }else{
            let links = $('link[type=application/rss+xml]'); //jquery get all hyperlinks
            $(links).each(function(i, link){
                title = $(link).attr('title')
                //response[i] = {'title': title, 'url': url.resolve(urlWithProtocol, $(link).attr('href'))}
                response[i] = {'title': title, 'url': url.resolve(urlWithProtocol, $(link).attr('href'))}
              });
        }

        

        const getFavicon = () =>{
            let favicon = undefined;
            let links = $("link");
            for (let i = 0; i < links.length; i++)
            {
                if(($(links[i]).attr("rel") == "icon")||($(links[i]).attr("rel") == "shortcut icon"))
                {
                    favicon = $(links[i]).attr("href");
                }
            }
            if (!favicon) {
                const domain = (new URL(sourceUrl))
                const host = setHttp(domain.hostname)
                favicon = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${host}&size=128`
            }
            return favicon;        
        }
        const favicon = getFavicon();
        
        for (const key in response) {
            response[key]['favicon']=favicon
        }

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