var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var he = require('he');

var app = express();
app.use(express.static('public'));

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});



app.get('/baidu', function(req, res) {
  var word = req.query.word;
  var page = req.query.page;

  word = encodeURIComponent(word);

  var url = `http://www.baidu.com/s?wd=${word}&pn=${(page - 1) * 10}`;

  fetch(url, req, res);
});


function fetch(url, req, res) {
  request({url: url, timeout: 5000}, function(err, baiduRes, body) {
    if (err) {
      res.status(500).end(err.message);

    } else {
      var ret = [];
      var $ = cheerio.load(body, {decodeEntities: false});
      var resultOp = $('#content_left .result-op');
      var resultNormal = $('#content_left .result');

      var getInfo = function(item) {
        var $item = $(item);
        var anchor = $item.find('.t a');
        var info = $item.find('.f13 .g');

        ret.push({
          href: anchor.attr('href'),
          text: he.decode( anchor.text().trim(), {
            strict: false
          } ),
          info: he.decode( info.text().trim(), {
            strict: false
          } ),
        });
      };

      resultOp.each(function() {
        getInfo(this);
      });

      resultNormal.each(function() {
        getInfo(this);
      });

      // random delay
      var delay = Math.floor(Math.random() * (1000 - 0 + 1)) + 0;
      setTimeout(function() {
        res.json(ret);
      }, delay);
    }
  });
}