//// Core modules

//// External modules
const express = require('express')
const lodash = require('lodash')

//// Core modules

//// Modules
const middlewares = require('../middlewares');

// Router
let router = express.Router()

router.use('/services', middlewares.requireAuthUser)

router.get('/services/tarp', async (req, res, next) => {
    try {
        let data = {}
        res.render('services/tarp.html', data);
    } catch (err) {
        next(err);
    }
});


router.get('/services/video', async (req, res, next) => {
    try {
        let data = {}
        res.render('services/video.html', data);
    } catch (err) {
        next(err);
    }
});

// View s3 object using html page
router.get('/file-viewer/:bucket/:prefix/:key', middlewares.requireAuthUser, async (req, res, next) => {
    try {
        let bucket = lodash.get(req, "params.bucket", "");
        let prefix = lodash.get(req, "params.prefix", "");
        let key = lodash.get(req, "params.key", "");

        let url = s3.getSignedUrl('getObject', {
            Bucket: bucket,
            Key: prefix + '/' + key
        })

        res.render('file-viewer.html', {
            url: url,
        });
    } catch (err) {
        next(err);
    }
});

// Get s3 object content
router.get('/file-getter/:bucket/:prefix/:key', async (req, res, next) => {
    try {
        let bucket = lodash.get(req, "params.bucket", "");
        let prefix = lodash.get(req, "params.prefix", "");
        let key = lodash.get(req, "params.key", "");

        let url = s3.getSignedUrl('getObject', {
            Bucket: bucket,
            Key: prefix + '/' + key,
        })

        res.redirect(url);
    } catch (err) {
        next(err);
    }
});

module.exports = router;