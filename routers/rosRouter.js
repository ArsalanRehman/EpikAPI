const express = require('express');
const authController = require('./../controllers/authController');
const rosController = require('./../controllers/rosController');
const positionController = require('../controllers/positionController');

const router = express.Router();

router.post(
  '/rosApi',
  // authController.protect,
  rosController.listenCommand
);
router.post(
  '/joystick',
  // authController.protect,
  rosController.joystick
);

router.get(
  '/battery',
  // authController.protect,
  rosController.batteryStatus
);

router.get(
  '/robotStatus',
  // authController.protect,
  rosController.robotStatus
);

router
  .route('/positionMarker')
  .get(positionController.getAllPositionMarkers)
  .post(positionController.createPositionMarker);

router
  .route('/positionMarker/:id')
  .get(positionController.getPositionMarker)
  .delete(positionController.deletePositionMarker);

router.post('/sendGoal/:id', positionController.sendGoal);

module.exports = router;
