var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('painter', { title: 'Hello, Canvas!' });
});

module.exports = router;
