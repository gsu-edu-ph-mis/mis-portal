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

router.use('/survey', middlewares.requireAuthUser)
router.use('/survey', middlewares.requireAdminUser)

router.get('/survey/all', async (req, res, next) => {
    try {
        let surveys = await req.app.locals.db.models.Survey.findAll()
        let data = {
            surveys: surveys
        }
        res.render('survey/all.html', data);
    } catch (err) {
        next(err);
    }
});

router.get('/survey/thanks', async (req, res, next) => {
    try {
        res.render('survey/thanks.html');
    } catch (err) {
        next(err);
    }
});

router.get('/survey/:surveyId/download', async (req, res, next) => {
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