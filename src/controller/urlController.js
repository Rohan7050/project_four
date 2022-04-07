const urlModel = require("../model/urlModel")
const shortid = require('shortid');
const validUrl = require('valid-url')
const redis = require("redis")
const util = require("util");
const { json } = require("express");

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-');

const redisClient = redis.createClient(
    16351,
   "redis-16351.c212.ap-south-1-1.ec2.cloud.redislabs.com",
   {no_ready_check: true}
)
//, legacyMode: true
redisClient.auth("TNnAwMnbmXfz1oB9I9TB63UruxaLjVqb", function(err) {
    if (err){
        throw err
    }
})

redisClient.on("connect", async function (){
    console.log("Connected to Redis")
})

const SET_ASYNC = util.promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = util.promisify(redisClient.GET).bind(redisClient);
const EXP_ASYNC = util.promisify(redisClient.expire).bind(redisClient)

const isValid = (value) => {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const createUrl = async (req, res) => {
    try{
        const url = req.body.url
        const data = {}
        if (!isValid(url)){
            return res.status(400).send({status: false, message: "please enter url"})
        }
        if (!validUrl.is_https_uri(url)){
            return res.status(400).send({status: false, message: "this is not a valid url"})
        }
        const baseUrl = "http://127.0.0.1:3000"
        const shortId = shortid.generate().toLowerCase()
        const shortUrl = `${baseUrl}/${shortId}` // baseUrl + "/" + shortUrl
        data.urlCode = shortId
        data.shortUrl = shortUrl
        data.longUrl = url
        const isUrlCodeInUse = await urlModel.findOne({longUrl: data.longUrl})
        if (isUrlCodeInUse){
            // await SET_ASYNC(`${isUrlCodeInUse.urlCode}`, JSON.stringify(isUrlCodeInUse))
            // await EXP_ASYNC(`${isUrlCodeInUse.urlCode}`, 60)
            return res.status(200).send({status: true, message: "already have short url for this long url" , data: isUrlCodeInUse})
        } 
        const shortend = await urlModel.create(data)
        await SET_ASYNC(`${data.urlCode}`, JSON.stringify(shortend))
        await EXP_ASYNC(`${data.urlCode}`, 60)
        return res.status(201).send({status: true, data: shortend})
    }catch(error){
        res.status(500).send({status: false, message: error.message})
    }
}

const redirectTo = async (req, res) => {
    try{
        const {urlCode} = req.params
        if (!shortid.isValid(urlCode)){
            return res.status(400).send({status: false, message: "this is not a valid url"})
        }
        let check = await GET_ASYNC(`${urlCode}`)
        if (check){
            let doc = JSON.parse(check)
            console.log("from caches")
            // return res.status(200).send({from: "caches", data: doc})
            return res.status(302).redirect(doc.longUrl)
        }else{
            const isUrlCodePresent = await urlModel.findOne({urlCode: urlCode})
            if (!isUrlCodePresent){
                return res.status(404).send({status: false, message: "this url does not exist"})
            }
            await SET_ASYNC(`${urlCode}`, JSON.stringify(isUrlCodePresent))
            await EXP_ASYNC(`${urlCode}`, 60)
            // await redisClient.expire(`${urlCode}`, 30)
            console.log("from MongoDB")
            return res.status(302).redirect(isUrlCodePresent.longUrl)
            // return res.status(200).send({from: "MongoDb", data: isUrlCodePresent})
        }
    }catch(error){
        res.status(500).send({status: false, message: error.message})
    }
}

module.exports.createUrl = createUrl
module.exports.redirectTo = redirectTo
