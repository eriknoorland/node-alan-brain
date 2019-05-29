const express = require('express');
const router = express.Router();

router.get('/config', (request, response) => {
  // read config.json
  // response.jsonp();
});

router.post('/config', (request, response) => {
  // get body from request
  // JSON.parse
  // write to config.json
  // response.send();
});

module.exports = router;
