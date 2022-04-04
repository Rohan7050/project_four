const urlModel = require("../model/urlModel")
const shortid = require('shortid');

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-');
// console.log(shortid.generate().toLowerCase());

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
            return res.status(400).send({status: false, msg: "please enter url"})
        }
        const baseUrl = "http://127.0.0.1:3000"
        const shortId = shortid.generate().toLowerCase()
        const shortUrl = `${baseUrl}/${shortId}` // baseUrl + "/" + shortUrl
        data.urlCode = shortId
        data.shortUrl = shortUrl
        data.longUrl = url
        const shortend = await urlModel.create(data)
        return res.status(201).send({status: true, data: shortend})
    }catch(error){
        res.status(500).send({status: false, msg: error.message})
    }
}

const redirectTo = async (req, res) => {
    try{
        const {urlCode} = req.params
        if (!shortid.isValid(urlCode)){
            return res.status(400).send({status: false, msg: "this is not a valid url"})
        }
        const isUrlCodePresent = await urlModel.findOne({urlCode: urlCode})
        if (!isUrlCodePresent){
            return res.status(404).send({status: false, msg: "this url does not exist"})
        }
        res.status(301).redirect(isUrlCodePresent.longUrl)
    }catch(error){
        res.status(500).send({status: false, msg: error.message})
    }
}

module.exports.createUrl = createUrl
module.exports.redirectTo = redirectTo
