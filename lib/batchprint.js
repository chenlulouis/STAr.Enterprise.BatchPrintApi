const puppeteer = require('puppeteer');
const merge = require('easy-pdf-merge');
const path = require('path');
const fs = require('fs');
const uuid = require('node-uuid');
const Config = require('./config');
const events = require('events');
/**
 * 构造函数
 */
var BatchPrint = function() {};

/**
 * 打印页面至PDF
 */
BatchPrint.printpagetopdf = function(jobs, res) {
  var promiselist = []; //定义一个Promise队列
  /**
   * 启动Chome
   */
  puppeteer.launch().then(browser => {
    console.info('---export to pdf start at %s-----', new Date());
    console.info('---file count:%s', jobs.length);
    //创建UUID和临时目录
    const currentjobid = uuid.v4();
    const truncate = (str, len) =>
      str.length > len ? str.slice(0, len) + '…' : str;
    const currentjobdirectory = path.join(
      path.dirname(__dirname),
      'temp',
      currentjobid
    );
    console.info('---create dir :%s', currentjobdirectory);
    fs.mkdirSync(currentjobdirectory);

    //用foreach遍历jobs
    jobs.forEach(job => {
      promiselist.push(
        new Promise(async function(resolve, reject) {
          /**
             * 为每个job定义一个Promise。
             * 执行所有同步操作。
             */
          console.info('---start convert to pdf job :%s', job.docname);
          //打开一个新页面
          const page = await browser.newPage();
          const nowTime = +new Date();
          let reqCount = 0;
          let reqfinishedCount = 0;
         
          /**
           *创建一个监听事件
           *监听reqcountadd,如果触发事件则执行一个异步方法
           *比较reqcount和reqfinishedCount两个数
           *如果相等,则认为请求结束。则继续执行转PDF的操作。
           */
          const emitter = new events.EventEmitter();
          emitter.on('reqcountadd', async () => {
            // console.log(reqCount);
            if (reqfinishedCount == reqCount) {
              console.info(
                'request count --%s,requestfinish count --%s',
                reqCount,
                reqfinishedCount
              );
              //转成PDF
              await page
                .pdf({
                  path: path.join(currentjobdirectory, job.docname + '.pdf'),
                  format: 'A4',
                  printBackground: true,
                  margin: {
                    top: '10mm',
                    bottom: '10mm',
                    left: '10mm',
                    right: '10mm'
                  }
                })
                .then(file => {
                  if (file.byteLength > 0) {
                    resolve(currentjobdirectory); //抛出Promise的resolve消息
                  } else {
                    reject(currentjobdirectory); //抛出Promise的reject消息
                  }
                });
              await page.close();
              console.info('---end convert to pdf job :%s', job.docname);
            }
          });
          /**
           * 监听request的发出，记录reqCount
           */
          page.on('request', request => {
            const { url, method, resourceType } = request;
            //只判断XHR请求
            if (resourceType === 'XHR') {
              reqCount++;
            }
          });

          /**
           * 监听request的结束
           */
          page.on('requestfinished', request => {
            const { url, method, resourceType } = request;
            if (resourceType === 'XHR') {
              console.log(`✅ ${method} ${resourceType} ${url}`);
              /**
               * 手动等待request的结束后1000ms,再为reqfinishedCount加1,
               * 并触发响应事件。
               */
              setTimeout(function() {
                reqfinishedCount++;
                emitter.emit('reqcountadd');
              }, 1000);
            }
          });
          //导航到单页打印页面
          await page.goto(job.printpage, {
            waitUntil: 'networkidle',
            networkIdleTimeout: 90000,
            timeout: 30000000
          });
        })
      );
    });

    //Promise.all()监听所有Promise,全部结束后执行操作。
    Promise.all(promiselist).then(result => {
      browser.close();
      var currentjobdirectory = result[0];
      var currentjobid = path.basename(currentjobdirectory);
      const outputdir = path.join(
        path.dirname(__dirname),
        'download',
        currentjobid + '.pdf'
      );
      if (result.length === 0 || !result) return;
      if (result.length === 1) {
        let tomergefiles = [];
        fs.readdirSync(currentjobdirectory).forEach(file => {
          tomergefiles.push(path.join(currentjobdirectory, file));
        });
        var readStream = fs.createReadStream(tomergefiles[0]);

        var writeStream = fs.createWriteStream(outputdir);
        readStream.pipe(writeStream);
        var fileName = path.basename(outputdir); //req.params.fileName;

        var stats = fs.statSync(outputdir);
        if (stats.isFile()) {
          var downloadlink = `http://${Config.IP()}:${Config.PORT()}/download/${fileName}`;
          res.send(200, downloadlink);
        } else {
          res.send(404);
        }
      } else {
        let tomergefiles = [];
        fs.readdirSync(currentjobdirectory).forEach(file => {
          tomergefiles.push(path.join(currentjobdirectory, file));
        });

        merge(tomergefiles, outputdir, function(err) {
          if (err) return console.log(err);
          console.log('Successfully merged!');

          var fileName = path.basename(outputdir); //req.params.fileName;

          var stats = fs.statSync(outputdir);
          if (stats.isFile()) {
            var downloadlink = `http://${Config.IP()}:${Config.PORT()}/download/${fileName}`;
            res.send(200, downloadlink);
          } else {
            res.send(404);
          }
        });
      }
    });
  });
};

module.exports = BatchPrint;
