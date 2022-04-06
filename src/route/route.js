const express = require("express")

const urlController = require("../controller/urlController")

const router = express.Router()


router.post("/url/shorten", urlController.createUrl)

router.get("/:urlCode", urlController.redirectTo)

router.get("*", (req, res) => {
    res.status(404).send({status: false, massage: "page not found"})
})

router.post("*", (req, res) => {
    res.status(404).send({status: false, massage: "page not found"})
})



module.exports = router