const express = require('express');
const healthRouter = require('./health');
const authRouter = require('./auth');
const profileRouter = require('./profile');
const momRecordsRouter = require('./records/mom');
const homeRouter = require('./home');
const confinementRouter = require('./confinement');
const statsRouter = require('./stats');
const contentRouter = require('./content');

const router = express.Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/profile', profileRouter);
router.use('/records/mom', momRecordsRouter);
router.use('/home', homeRouter);
router.use('/confinement', confinementRouter);
router.use('/stats', statsRouter);
router.use('/content', contentRouter);

module.exports = router;
