const express = require('express');

const devicesController = require('../controllers/DevicesControllers');

const router = express.Router();

router.get('/all/:id', devicesController.getDeviceAllValues);
router.get('/last30days/:id', devicesController.getDeviceLast30DaysDataById);
router.get('/last7days/:id', devicesController.getDeviceLast7DaysDataById);
router.get('/today/:id', devicesController.getDeviceTodayDataById);
router.get('/data10/:id', devicesController.getDeviceTop10DataById);
router.get('/owner/:id', devicesController.getDevicesByOwnerId);

router.post('/new/:macAddress/:type/:location/:ownerEmail', devicesController.postCreateDevice);
router.post('/:macAddress/:value', devicesController.postDeviceValue);

module.exports = router;