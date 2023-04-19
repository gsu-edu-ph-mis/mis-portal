//// Core modules

//// External modules
const express = require('express')
const lodash = require('lodash')
const moment = require('moment')
const flash = require('kisapmata')
const { Sequelize } = require('sequelize')

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

// Delete
router.get('/survey/:surveyId/delete', middlewares.getSurvey(), async (req, res, next) => {
    try {
        let survey = res.survey
        let data = {
            survey: survey
        }
        res.render('survey/delete.html', data);
    } catch (err) {
        next(err);
    }
});
router.post('/survey/:surveyId/delete', middlewares.getSurvey({ raw: false }), async (req, res, next) => {
    try {
        let survey = res.survey
        await survey.destroy()
        flash.ok(req, 'survey', `Survey deleted.`)
        res.redirect('/survey/all')
    } catch (err) {
        next(err);
    }
});


module.exports = router;