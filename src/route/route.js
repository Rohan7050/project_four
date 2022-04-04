const express = require("express")

const urlController = require("../controller/urlController")

const router = express.Router()


router.post("/url/shorten", urlController.createUrl)

router.get("/:urlCode", urlController.redirectTo)

router.get("/test", (req, res) => {
    res.status(301).redirect("https://github.com/Rohan7050/project_four/tree/project/urlShortnerGroup45")
})



module.exports = router