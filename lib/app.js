var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

var Log = require('log');
var formidable = require('formidable');
var parse = require('co-busboy');
var co = require('co');
var appConfig = require('./config.json');

var koa = require('koa');
var error = require('koa-json-error')
var app = koa();

//log
var log = new Log('info');

//cache
var LRU = require("lru-cache"),
	options = { 
		max: 10, 
		maxAge: 1000 * 60 * 60 
	}, 
	cache = LRU(options);

var router = require('koa-router')();

/**
 * 单文件签名
 * @method  POST
 * @params  
 * 		hash : 使用的 hash 算法，默认 md5 , N
 * 		sign : openssl list-public-key-algorithms 中列出的算法, 默认 RSA-SHA256, N
 * 		format : 返回签名的格式 <'hex'|'base64'|'binary'>, N
 * 		app : 应用名, N
 */
router.post('/sign', function *(){
	var part,
		config = appConfig.sign,
		key_path;

	//parse body
	var form = yield parseForm(this.req);

	for(var filename in form.files){
		if(form.files.hasOwnProperty(filename)){
			var file = form.files[filename];
			var app = form.fields.app || 'default',
				key_path = config[app] && config[app].private,
				key;
			try{
				if(!key_path){
					throw new Error('private key not found');
				}
				key = yield readFile(key_path);
			}catch(e){
				this.body = {
					error : 'private key not found'
				};
				return;
			}
			//process file
			var buffer = yield steamToBuffer(fs.createReadStream(file.path));
			if(buffer.length==0){
				this.body = {
					error : 'empty file'
				};
				break
			}
			var hash = crypto.createHash(form.fields.hash || 'md5');
			hash.update(buffer);
			var sign = crypto.createSign(form.fields.sign || 'RSA-SHA256');
			sign.update(hash.digest());
			this.type = 'application/octet-stream';
			this.body = sign.sign(key, form.fields.format);
			return;
		}
	}
	this.body = {
		error : 'miss file'
	};
}).get('/sign', function *(){
	var app = this.query.app || 'default',
		config = appConfig.sign,
		key_path = config[app] && config[app].public;
	if(!key_path){
		this.body = {
			error : 'public key not found'
		};
		return;
	}
	this.type = 'application/octet-stream';
	try{
		this.body = yield readFile(key_path);
	}catch(e){
		this.body = {
			error : 'public key not found'
		};
	}
}).get('/', function *(){
	this.type = 'text/html';
	this.body = fs.createReadStream(path.resolve('./index.html'));
});

app.use(error({
	postFormat : function(e, obj){
		log.error('[app error]', JSON.stringify(obj));
		return {
			error : obj.message,
			e : obj
		};
	}
}));

app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  log.info('%s %s - %s', this.method, this.url, ms);
});

app.use(router.routes());

app.on('error', function(err){
	log.error('[app uncaught error]', err.stack);
});

module.exports = app;

function parseForm(req){
	return new Promise(function(resolve, reject){
		var form = new formidable.IncomingForm();
	    form.parse(req, function(err, fields, files) {
	    	if(err){
	    		reject(err);
	    		return;
	    	}
	    	resolve({
	    		fields : fields,
	    		files : files
	    	});
	    });
	});
}

function readFile(path){
	return new Promise(function(resolve, reject){
		var _cache;
		if(_cache = cache.get(path)){
			resolve(_cache);
			return;
		}
		fs.readFile(path, function(e, buffer){
			if(e){
				reject(e);
				return;
			}
			cache.set(path, buffer);
			resolve(buffer);
		});
	});
}

function steamToBuffer(steam){
	return new Promise(function(resolve, reject){
		var buffers = [],
			len = 0;
		steam.on('data', function(data){
			buffers.push(data);
			len += data.length;
		});
		steam.on('end', function(){
			var buffer = null;
			if(buffers.length===0){
				buffer = new Buffer(0);
			}else{
				buffer = new Buffer(len);
		        for (var i = 0,pos = 0,l = buffers.length; i<l; i++) {
		            var chunk = buffers[i];
		            chunk.copy(buffer, pos);
		            pos += chunk.length;
		        }
			}
		    resolve(buffer);
		});
		steam.on('error', function(e){
			reject(e);
		});
	});
}