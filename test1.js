var express = require('express');
var cheerio = require('cheerio');
var request = require('request');

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
	var resolvedCount = 0;

	res.write('<html>\
			<head></head>\
			<body>\
			    <h1> Following are the titles of given websites: </h1>\
			    <ul>');

	// Catch any uncaught error and send it to handler
	try {
		for(var i in addresses) {
			get_title_from_url(addresses[i], function(li) {
				res.write(li);

				// Close the body if all the URLs has been visited
				if(addresses.length === ++resolvedCount) {
					res.write('</ul>\
							</body>\
							</html>');
					res.end();
				}
			});
		}
	} catch (e) {
		next(e);
	}
})

// All other routes
.get('*', function(req, res, next) {
	res.status(404).send('404 Page not found.')
});
app.listen(3000);