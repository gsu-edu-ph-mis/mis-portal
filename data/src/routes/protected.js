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
const passwordMan = require('../password-man');
const S3_CLIENT = require('../aws-s3-client')  // V3 SDK

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


        // console.log(data)

        let tarp = await req.app.locals.db.models.Tarp.create({
            purpose: data.purpose,
            dateNeeded: data.dateNeeded,
            content: data.content,
            instructions: data.instructions,
            width: data.width,
            widthUnit: data.widthUnit,
            height: data.height,
            heightUnit: data.heightUnit,
            format: data.format,
            quantity: data.quantity,
            requestor: data.requestor,
            department: data.department,
            email: data.email,
            fb: data.fb,
            status: 'Pending',
            uid: passwordMan.genPasscode(),
        });

        // await req.app.locals.db.models.Passcode.create({
        //     tarpId: tarp.id,
        //     code: passwordMan.genPasscode(),
        //     expiredAt: moment(tarp.dateNeeded).add(1, 'month').toDate()
        // });

        await mailer.sendTarpEmail(data)
        res.redirect(`/services/tarp/thanks`)
    } catch (err) {
        next(err);
    }
});
router.get('/services/tarp/thanks', async (req, res, next) => {
    try {
        let data = {}
        res.render('services/tarp/thanks.html', data);
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
        data.survey.service = !Array.isArray(data.survey.service) ? [data.survey.service] : data.survey.service
        if (data.survey.serviceOthers) {
            let i = data.survey.service.indexOf('Others')
            if (i > -1) data.survey.service[i] = (data.survey.serviceOthers)
        }
        data.survey.service = data?.survey?.service?.join(', ')
        let survey = req.app.locals.db.models.Survey.build(data.survey)
        await survey.save()

        console.log(survey)
        res.redirect('/survey/thanks')
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

router.get('/services/tarp/:tarpUid/attach', middlewares.getTarpByUid(), async (req, res, next) => {
    try {
        let tarp = res.tarp
        
        if(tarp.status === 'Done'){
            throw new Error('Not allowed.')
        }
        let data = {
            tarp: tarp
        }
        res.render('services/tarp/attach.html', data);
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

        let url = await S3_CLIENT.getSignedUrl(bucket, prefix + '/' + key)

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

        let url = await S3_CLIENT.getSignedUrl(bucket, prefix + '/' + key)

        res.redirect(url);
    } catch (err) {
        next(err);
    }
});

module.exports = router;