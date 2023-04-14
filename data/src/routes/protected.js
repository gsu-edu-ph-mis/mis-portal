//// Core modules

//// External modules
const express = require('express')
const lodash = require('lodash')
const moment = require('moment')
const flash = require('kisapmata')

//// Core modules

//// Modules
const mailer = require('../mailer');
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
router.post('/services/tarp', async (req, res, next) => {
    try {
        let data = req.body

        await mailer.sendTarpEmail(data)
        res.redirect(`/services/thanks`)
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
router.post('/services/video', async (req, res, next) => {
    try {
        let data = req.body
        data.format = !Array.isArray(data.format) ? [data.format] : data.format

        await mailer.sendVideoEmail(data)
        res.redirect(`/services/thanks`)
    } catch (err) {
        next(err);
    }
});

router.get('/services/survey', async (req, res, next) => {
    try {
        let data = {
            dateStart: moment().format('YYYY-MM-DD')
        }
        res.render('services/survey.html', data);
    } catch (err) {
        next(err);
    }
});
router.post('/services/survey', async (req, res, next) => {
    try {
        let data = {
            survey: req.body
        }
        let survey = req.app.locals.db.models.Survey.build(data.survey)
        await survey.save()

        console.log(survey)
        return res.redirect('/services/thanks')
        res.render('services/survey-paper.html', data);
    } catch (err) {
        next(err);
    }
});

router.get('/services/thanks', async (req, res, next) => {
    try {
        let data = {}
        res.render('services/thanks.html', data);
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