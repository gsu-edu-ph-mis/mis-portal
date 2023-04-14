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

router.use('/surveys', middlewares.requireAuthUser)
router.use('/surveys', middlewares.requireAdminUser)

router.get('/surveys/all', async (req, res, next) => {
    try {
        let surveys = await req.app.locals.db.models.Survey.findAll()
        let data = {
            surveys: surveys
        }
        res.render('surveys/all.html', data);
    } catch (err) {
        next(err);
    }
});

router.get('/surveys/:surveyId/download', async (req, res, next) => {
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
        res.render('services/survey-paper.html', data);
    } catch (err) {
        next(err);
    }
});

module.exports = router;