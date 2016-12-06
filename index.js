var md5 = require('blueimp-md5');
var http = require('http');
var https = require('https');
var url = require('url');
var util = require('util');
var zlib = require('zlib');
var appkey = '4ebafd7c4951b366';
var secret = '8cb98205e9b2ad3669aad0fce12a4c13';
http.createServer(function(req, res){
	//Content-Type: text/json;charset=utf-8
	res.writeHead(200, {'Content-Type': 'application/json','Access-Control-Allow-Origin':'*'});
	var av=url.parse(req.url, true).query.av;
	var cid=url.parse(req.url, true).query.cid;
	if(cid){
			console.log('cid find')
			https.get(getburl(cid), function(res2) {
			var jsonx=''
			res2.on('data', function(data) {
			 jsonx+=data
			})
			res2.on('end',function(){
			res.end(jsonx)
			})
			}).on('error', function(e) {
			console.error(e);
			console.log('eero web server not found')
			})
	}
	else if (av) {
		console.log('av : '+av)
		https.get(`https://www.bilibili.com/widget/getPageList?aid=${av}`, function(res1) {
			  var chunks = [];
			   res1.on('data', function(chunk) {
			      chunks.push(chunk);
			    });
			res1.on('end', function() {
			  var buffer = Buffer.concat(chunks);
			   zlib.gunzip(buffer, function(err, decoded) {
		         try{
		          var json=JSON.parse(decoded);
		          var cid=json[0].cid;
		          console.log('cid: '+cid)
		          	https.get(getburl(cid), function(res2) {
					  var jsonx=''
					  res2.on('data', function(data) {
					   jsonx+=data
					  })
					 res2.on('end',function(){
					  res.end(jsonx)
					 })

					}).on('error', function(e) {
					  console.error(e);
					  console.log('eero web server not found')
					})
				}
				  catch(e)
					 {
					     console.log('video error..');
						 res.end('[ { "success": false } ]');
					 }

		        });
			 })

			}).on('error', function(e) {
			  console.error(e);
			  console.log('eero web server not found')
			})
	}
	else{
		 res.end('[ { "success": false,"message":"传入参数错误  av或者cid 未找到" } ]');
	}

}).listen(3434);

function getburl(cid) {
    var sign = md5(`appkey=${appkey}&cid=${cid}&otype=json&quality=2&type=mp4${secret}`);
    var dz=`https://interface.bilibili.com/playurl?cid=${cid}&appkey=${appkey}&otype=json&type=mp4&quality=2&sign=${sign}`
    console.log(dz)
    return dz;
}
