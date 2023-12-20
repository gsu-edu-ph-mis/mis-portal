//// Core modules

//// External modules
const express = require('express')
const lodash = require('lodash')
const moment = require('moment')
const flash = require('kisapmata')
const { Sequelize } = require('sequelize')
const qr = require('qr-image')
const sharp = require('sharp')

//// Core modules

//// Modules
const mailer = require('../mailer');
const middlewares = require('../middlewares');
const S3_CLIENT = require('../aws-s3-client')  // V3 SDK

// Router
let router = express.Router()

router.use('/admin', middlewares.requireAdminUser)

router.get('/admin/all', async (req, res, next) => {
    try {
        res.redirect('/admin/tarp/all')
    } catch (err) {
        next(err);
    }
});

//// TARP
router.get('/admin/tarp/all', async (req, res, next) => {
    try {
        let s = req.query?.s
        let where = {}
        if (s) {
            where = {
                purpose: {
                    [Sequelize.Op.like]: `%${s}%`
                }
            }
        }
        let tarps = await req.app.locals.db.models.Tarp.findAll({
            where: where
        })
        // tarps = tarps.map((tarp)=>{
        //     tarp.dateNeeded = moment(tarp.dateNeeded).format('YYYY-MM-DD')
        //     return tarp
        // })
        
        let data = {
            tarps: tarps,
            s: s,
            flash: flash.get(req, 'admin')
        }
        // return res.send(tarps)
        res.render('admin/tarp/all.html', data);
    } catch (err) {
        next(err);
    }
});

router.get('/admin/tarp/:tarpId', middlewares.getTarp(), async (req, res, next) => {
    try {
        let tarp = res.tarp
        let qrPayload = `${CONFIG.app.url}/services/tarp/${tarp.uid}`
        let qrCode = qr.imageSync(qrPayload, { size: 10, type: 'png', margin: 1 })

        // Make white transparent
        qrCode = await sharp(qrCode).unflatten().toBuffer()
        qrCode = qrCode.toString('base64')

        let data = {
            tarp: tarp,
            qrCode: qrCode,
            qrPayload: qrPayload,
            flash: flash.get(req, 'admin')
        }
        // return res.send(tarp)
        res.render('admin/tarp/read.html', data);
    } catch (err) {
        next(err);
    }
});
router.post('/admin/tarp/:tarpId/set-attachment', middlewares.antiCsrfCheck, middlewares.getTarp(), middlewares.dataUrlToReqFiles(['attachment']), middlewares.handleUpload({ allowedMimes: ["image/jpeg"] }), async (req, res, next) => {
    try {
        let tarp = res.tarp
        // console.log(body)
        let attachments = [
            ...tarp.attachments,
            ...lodash.get(req, 'saveList.attachment', []),
        ]

        tarp.set({
            attachments: attachments,
        });
        await tarp.save()

        res.send(tarp)
    } catch (err) {
        next(err);
    }
});
router.post('/admin/tarp/:tarpId/delete-attachment', middlewares.antiCsrfCheck, middlewares.getTarp(), async (req, res, next) => {
    try {
        let tarp = res.tarp
        let attachment = tarp.attachments.find((a) => {
            return a === req.body.attachment
        })

        if (attachment) {
            console.log(attachment)
            // Delete files on AWS S3
            const bucketName = CONFIG.aws.bucket1.name
            const bucketKeyPrefix = CONFIG.aws.bucket1.prefix + '/'
            if (attachment) {
                let objects = [
                    { Key: `${bucketKeyPrefix}${attachment}` },
                    { Key: `${bucketKeyPrefix}tiny-${attachment}` },
                    { Key: `${bucketKeyPrefix}small-${attachment}` },
                    { Key: `${bucketKeyPrefix}medium-${attachment}` },
                    { Key: `${bucketKeyPrefix}large-${attachment}` },
                    { Key: `${bucketKeyPrefix}xlarge-${attachment}` },
                    { Key: `${bucketKeyPrefix}orig-${attachment}` },
                ]
                await S3_CLIENT.deleteObjects(bucketName, objects)
            }

            // Update DB
            tarp.attachments = tarp.attachments.filter((a) => {
                return a !== req.body.attachment
            })
            await tarp.save()
        }

        res.send(tarp)
    } catch (err) {
        next(err);
    }
});
router.post('/admin/tarp/:tarpId/set-status', middlewares.antiCsrfCheck, middlewares.getTarp(), async (req, res, next) => {
    try {
        let tarp = res.tarp
        let payload = req.body

        tarp.set({
            status: payload.status,
        });
        await tarp.save()

        res.send(tarp)
    } catch (err) {
        next(err);
    }
});

// Delete
router.get('/admin/tarp/:tarpId/delete', middlewares.getTarp(), async (req, res, next) => {
    try {
        let tarp = res.tarp
        if (tarp.attachments?.length > 0) {
            flash.error(req, 'admin', `Cannot delete. Please delete the tarp photos first.`)
            return res.redirect('/admin/tarp/all')
        }
        let data = {
            tarp: tarp
        }
        res.render('admin/tarp/delete.html', data);
    } catch (err) {
        next(err);
    }
});
router.post('/admin/tarp/:tarpId/delete', middlewares.getTarp(), async (req, res, next) => {
    try {
        let tarp = res.tarp
        await tarp.destroy()
        flash.ok(req, 'admin', `Tarp deleted.`)
        res.redirect('/admin/tarp/all')
    } catch (err) {
        next(err);
    }
});

//// SURVEY
router.get('/admin/survey/all', async (req, res, next) => {
    try {
        let s = req.query?.s
        let where = {}
        if (s) {
            where = {
                name: {
                    [Sequelize.Op.like]: `%${s}%`
                }
            }
        }
        let surveys = await req.app.locals.db.models.Survey.findAll({
            where: where
        })
        let data = {
            surveys: surveys,
            s: s,
            flash: flash.get(req, 'survey')
        }
        res.render('admin/survey/all.html', data);
    } catch (err) {
        next(err);
    }
});

router.get('/admin/survey/thanks', async (req, res, next) => {
    try {
        res.render('admin/survey/thanks.html');
    } catch (err) {
        next(err);
    }
});

router.get('/admin/survey/:surveyId/download', async (req, res, next) => {
    try {
        let survey = await req.app.locals.db.models.Survey.findOne({
            where: {
                id: req.params?.surveyId
            },
            raw: true
        })
        let data = {
            survey: survey
        }
        res.render('admin/survey/survey-paper.html', data);
    } catch (err) {
        next(err);
    }
});

// Delete
router.get('/admin/survey/:surveyId/delete', middlewares.getSurvey(), async (req, res, next) => {
    try {
        let survey = res.survey
        let data = {
            survey: survey
        }
        res.render('admin/survey/delete.html', data);
    } catch (err) {
        next(err);
    }
});
router.post('/admin/survey/:surveyId/delete', middlewares.getSurvey({ raw: false }), async (req, res, next) => {
    try {
        let survey = res.survey
        await survey.destroy()
        flash.ok(req, 'survey', `Survey deleted.`)
        res.redirect('/admin/survey/all')
    } catch (err) {
        next(err);
    }
});

module.exports = router;