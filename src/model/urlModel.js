const mongose = require("mongoose")

const urlSchema = new mongose.Schema({
    urlCode: {
        type: String,
        required: "urlCode is required",
        unique: true,
        trim: true,
        lowercase: true
    },
    longUrl: {
        type: String,
        required: "please enter longUrl",
        unique: true
    },
    shortUrl: {
        type: String,
        required: "please enter shortUrl",
        trim: true,
        unique: true
    }
}, {timestamps: true});

module.exports = new mongose.model("Url", urlSchema)
