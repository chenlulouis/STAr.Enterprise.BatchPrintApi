const restify = require('restify');
const BatchPrint = require('./lib/batchprint');

// var EventEmitter = require('events').EventEmitter;
// var ee = new EventEmitter();

// /*
//     EventEmitter.setMaxListeners (n)   给EventEmitter设置最大监听
//     参数1： n 数字类型，最大监听数

//     超过10个监听时，不设置EventEmitter的最大监听数会提示：
//     (node) warning: possible EventEmitter memory leak detected. 11 listeners added.
//      Use emitter.setMaxListeners() to increase limit.
//     设计者认为侦听器太多，可能导致内存泄漏，所以存在这样一个警告
// */
// ee.setMaxListeners(100);

//指定Server的IP地址和端口
const ip_addr = '127.0.0.1';
const port = '8080';

//启动Server
var server = restify.createServer({
  name: 'Batch-Print-Server'
});

//启动服务端监听
server.listen(port, ip_addr, function() {
  console.log('%s listening at %s ', server.name, server.url);
});
//启用restify的插件
server.use(restify.plugins.queryParser());
server.use(
  restify.plugins.bodyParser({
    requestBodyOnGet: true
  })
);
// server.use(restify.pre.userAgentConnection());
// Lets try and fix CORS support
// By default the restify middleware doesn't do much unless you instruct
// it to allow the correct headers.
//
// See issues:
// https://github.com/mcavage/node-restify/issues/284 (closed)
// https://github.com/mcavage/node-restify/issues/664 (unresolved)
//
// What it boils down to is that each client framework uses different headers
// and you have to enable the ones by hand that you may need.
// The authorization one is key for our authentication strategy
//
let ALLOW_HEADERS = [];
ALLOW_HEADERS.push('authorization');
ALLOW_HEADERS.push('withcredentials');
ALLOW_HEADERS.push('x-requested-with');
ALLOW_HEADERS.push('x-forwarded-for');
ALLOW_HEADERS.push('x-real-ip');
ALLOW_HEADERS.push('x-customheader');
ALLOW_HEADERS.push('user-agent');
ALLOW_HEADERS.push('keep-alive');
ALLOW_HEADERS.push('host');
ALLOW_HEADERS.push('accept');
ALLOW_HEADERS.push('connection');
ALLOW_HEADERS.push('upgrade');
ALLOW_HEADERS.push('content-type');
ALLOW_HEADERS.push('dnt'); // Do not track
ALLOW_HEADERS.push('if-modified-since');
ALLOW_HEADERS.push('cache-control');

// Manually implement the method not allowed handler to fix failing preflights
//

//cors request pemisson
server.use(function crossOrigin(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Connection,Origin,Accept,X-Requested-With,content-type'
  );
  return next();
});

//option method allowed
server.on('MethodNotAllowed', function(request, response) {
  if (
    request.method.toUpperCase() === 'OPTIONS' ||
    'POST' ||
    'GET' ||
    'DELETE' ||
    'PUT'
  ) {
    // Send the CORS headers
    //
    response.header('Access-Control-Allow-Credentials', true);
    response.header('Access-Control-Allow-Headers', ALLOW_HEADERS.join(', '));
    response.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.header('Access-Control-Allow-Origin', request.headers.origin);
    response.header('Access-Control-Max-Age', 0);
    response.header('Content-type', 'application/json charset=UTF-8');
    response.header('Content-length', 0);

    response.send(204);
  } else {
    response.send(new restify.MethodNotAllowedError());
  }
});

//指定根路由返回内容
server.get('/', function(req, res, next) {
  res.send('Hello BatchPrint!');
  return next();
});

//指定下载
server.get(
  /\/download\/?.*/,
  restify.plugins.serveStatic({
    directory: './download/',
    default: 'index.html',
    appendRequestPath: false
  })
);

// testing the service
server.post('/print', printasync);

function printasync(req, res, next) {
  if (typeof req.body === 'object') {
    // BatchPrint.printtopdf(req.body);
     BatchPrint.printpagetopdf(req.body, res);
   
  } else {
     BatchPrint.printpagetopdf(JSON.parse(req.body), res);
   
  }
}
