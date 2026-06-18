const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    code: 0,
    message: 'ok',
    data: {
      service: 'tinydays-server',
      timestamp: Date.now(),
    },
  });
});

module.exports = router;
