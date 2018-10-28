var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');

var app = express();

var get_title_from_url = function(link, callback) {
	request(get_cleaned_url(link), function(err, resp, body) {
		if(err) return callback('<li> '+link+' - "NO RESPONSE" </li>');

		$ = cheerio.load(body);
		var title = $('title').html();
		callback('<li> '+link+' - "'+title+'" </li>');
	});
};

var get_cleaned_url = function(url) {
	// add http if needed
	return (url.indexOf('http') !== 0) ? ('http://'+url) : url;
};

app.get('/I/want/title/', function(req, res, next) {
	// Change address to address array if url has single address
	var addresses = (typeof req.query.address == 'string') ? [req.query.address] : req.query.address;

	res.write('<html>\
			<head></head>\
			<body>\
			    <h1> Following are the titles of given websites: </h1>\
			    <ul>');

	// Catch any uncaught error and send it to handler
	try {
		async.each(addresses, (value, callback) => {
			get_title_from_url(value, function(li) {
				res.write(li);
				callback();
			});
		}, function(err) {
			if(err) return next(err);

			res.write('</ul>\
					</body>\
					</html>');
			res.end();
		});
	} catch (e) {
		next(e);
	}
})

// All other routes
.get('*', function(req, res, next) {
	res.status(404).send('404 Page not found.')
});
app.listen(3000);