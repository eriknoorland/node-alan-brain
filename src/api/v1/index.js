const fs = require('fs');
const express = require('express');

const router = express.Router();

router.get('/settings', (request, response) => {
  fs.readFile(`${__dirname}/../../config.json`, (error, data) => {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(data));
  });
});

router.put('/settings', () => {
  // JSON.stringify(request.body, null, 2);
  // get body from request
  // JSON.parse
  // write to config.json
  // response.jsonp(JSON.stringify(request.body));
});

module.exports = router;
