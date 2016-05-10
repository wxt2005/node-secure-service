var path = require('path');
var crypto = require('crypto');
var fs = require('fs');
var assert = require('assert');

var request = require('supertest');
var app = require('../lib/app.js');


describe('sign', function(){
	it('should return status 200', function(done){
		request(app.listen())
			.post('/sign')
			.set('Content-type', 'multipart/form-data')
			.attach('file', path.resolve('./test/origin.txt'))
			.expect(200)
			.expect('Content-Type', 'application/octet-stream')
			.end(function(err, res) {
		       if (err) return done(err);
		       done();
		    });
	});
	it('should return miss file error', function(done){
		request(app.listen())
			.post('/sign')
			.expect(200, {
		    	error : 'miss file'
		    }, done);
	});
	it('should return empty file error', function(done){
		request(app.listen())
			.post('/sign')
			.set('Content-type', 'multipart/form-data')
			.attach('file', new Buffer(0))
			.expect(200, {
		    	error : 'empty file'
		    }, done);
	});
	it('should return private key not found', function(done){
		request(app.listen())
			.post('/sign')
			.set('Content-type', 'multipart/form-data')
			.field('app', 'djao')
			.attach('file', path.resolve('./test/origin.txt'))
			.expect(200, {
		    	error : 'private key not found'
		    }, done);
	});
	it('signature', function(done){
		request(app.listen())
			.post('/sign')
			.set('Content-type', 'multipart/form-data')
			.field('format', 'base64')
			.attach('file', path.resolve('./test/origin.txt'))
			.end(function(err, res) {
		       	if (err) return done(err);
		       	var hash = crypto.createHash('md5');
				hash.update(fs.readFileSync(path.resolve('./test/origin.txt')));
				var verify = crypto.createVerify('SHA256');
				verify.update(hash.digest());
				assert(verify.verify(fs.readFileSync(path.resolve('./public.pem')), res.text, 'base64'));
				done();
		    });
	});
});
