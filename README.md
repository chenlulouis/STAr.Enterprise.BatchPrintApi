# STAr.Enterprise.BatchPrintApi

## 项目背景

为了解决批量打印对html页面的支持问题，以及提高速度和降低依赖，设计了这个项目。

## 相关技术

### [Node.js](https://nodejs.org/zh-cn/)

[Node.js](https://nodejs.org/zh-cn/)是一个Javascript运行环境(runtime)，发布于2009年5月，由Ryan Dahl开发，实质是对Chrome V8引擎进行了封装。
Node.js对一些特殊用例进行优化，提供替代的API，使得V8在非浏览器环境下运行得更好。V8引擎执行Javascript的速度非常快，性能非常好。
Node.js是一个基于Chrome JavaScript运行时建立的平台， 用于方便地搭建响应速度快、易于扩展的网络应用。
Node.js 使用事件驱动，非阻塞I/O 模型而得以轻量和高效，非常适合在分布式设备上运行数据密集型的实时应用。

### [Restify](http://restify.com/)

Restify 是一个 Node.JS 模块，可以让你创建正确的 REST web services。它借鉴了很多 express 的设计，因为它是 node.js web 应用事实上的标准 API。

### [headless-chrome](https://developers.google.com/web/updates/2017/04/headless-chrome)

Headless Chrome 是 Chrome 浏览器的无界面形态，可以在不打开浏览器的前提下，使用所有 Chrome 支持的特性运行你的程序。相比于现代浏览器，Headless Chrome 更加方便测试 web 应用，获得网站的截图，做爬虫抓取信息等。相比于出道较早的 PhantomJS，SlimerJS 等，Headless Chrome 则更加贴近浏览器环境。

### [puppeteer](https://github.com/GoogleChrome/puppeteer)

Puppeteer 是一个控制 headless Chrome 的 Node.js API 。它是一个 Node.js 库，通过 DevTools 协议提供了一个高级的 API 来控制 headless Chrome。它还可以配置为使用完整的（非 headless）Chrome。
在浏览器中手动完成的大多数事情都可以通过使用 Puppeteer 完成，下面是一些入门的例子：

- 生成屏幕截图和 PDF 页面
- 检索 SPA 并生成预渲染内容（即“SSR”）
- 从网站上爬取内容
- 自动提交表单，UI测试，键盘输入等
- 创建一个最新的自动测试环境。使用最新的 JavaScript 和浏览器功能，在最新版本的 Chrome 中直接运行测试
- 捕获网站的时间线跟踪，以帮助诊断性能问题

## 项目主要功能

- 提供一个Web API,接收用户的批量打印请求。请求中至少携带一个页面的URL地址。
- 处理批量打印请求，使用Chrome 的 headless方式访问请求中指定的页面。
- 使用Chrome的API将网页另存为PDF文档。
- 提供PDF文档的URL供下载或者浏览。
- 使用easy-pdf-merge合并多个PDF文件。

## 项目准备

以Windows开发环境为例。

### 1. 安装Node.js

到[Node.js](https://nodejs.org/zh-cn/)官网下载最新版的node.js,版本要求>8.0 。

### 2. 创建项目

在你认为合适的地方创建一个STAr-BatchPrint(可自定义)文件夹，使用CMD打开文件夹，执行如下命令:

    npm init

npm 会引导你创建package.json的文件。关于NPM其他相关命令请参考[NPM命令说明](https://docs.npmjs.com/cli/init)

### 3. 安装扩展包

在命令行 执行

    npm install restify puppeteer --save

安装 Restify和Pupperteer两个包，记得加上--save以便更新至packag.json中。
pupeteer会下载一个特别的Chrome浏览器到你的项目中，大概120MB，请耐心等待...

至此，项目开发环境就全部搭建完成。
