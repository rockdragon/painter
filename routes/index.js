var express = require('express');
var router = express.Router();
var socketio = require('../game/socketio');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Hello, Canvas!' });
});

router.post('/query', function(req, res, next) {
    var exists = socketio.exists_nick_name(req.param.nick_name);
    return res.json({exists: exists})
});

module.exports = router;
