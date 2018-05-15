(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("./dist/test", [], factory);
	else if(typeof exports === 'object')
		exports["./dist/test"] = factory();
	else
		root["./dist/test"] = factory();
})(global, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading wasm modules
/******/ 	var installedWasmModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// object with all compiled WebAssembly.Modules
/******/ 	__webpack_require__.w = {};
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./test.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../settings":
/*!******************************!*\
  !*** external "../settings" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("../settings");

/***/ }),

/***/ "./model/jobLogs.js":
/*!**************************!*\
  !*** ./model/jobLogs.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _mongoose = _interopRequireDefault(__webpack_require__(/*! mongoose */ "mongoose"));

__webpack_require__(/*! ./mongo */ "./model/mongo.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose.default.Schema;
let jobLogsSchema = new Schema({
  "jobName": {
    type: String
  },
  "status": String,
  "runAt": {
    type: Date,
    default: new Date()
  },
  "result": String,
  "jobInfo": String
});
module.exports = _mongoose.default.model('jobLogs', jobLogsSchema);

/***/ }),

/***/ "./model/mongo.js":
/*!************************!*\
  !*** ./model/mongo.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _mongoose = _interopRequireDefault(__webpack_require__(/*! mongoose */ "mongoose"));

var _settings = _interopRequireDefault(__webpack_require__(/*! ../settings */ "../settings"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose.default.connect(_settings.default.agendaMongoUrl, (err, db) => {
  if (!err) {
    console.log('数据库连接成功');
  } else {
    console.log('数据库连接失败');
  }
});

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.jobsReady = exports.router = exports.app = void 0;

var _util = __webpack_require__(/*! util */ "util");

var _agenda = _interopRequireDefault(__webpack_require__(/*! agenda */ "agenda"));

var _settings = _interopRequireDefault(__webpack_require__(/*! ../settings */ "../settings"));

var _util2 = __webpack_require__(/*! ./util */ "./src/util.js");

var _job = __webpack_require__(/*! ./job */ "./src/job.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  app,
  router
} = (0, _util2.bootstrapKoaApp)();
exports.router = router;
exports.app = app;
const agenda = new _agenda.default({
  db: {
    address: _settings.default.agendaMongoUrl,
    collection: _settings.default.collection
  }
});
const jobsReady = (0, _util.promisify)(agenda.on).bind(agenda)('ready').then(async () => {
  const jobs = agenda._mdb.collection(_settings.default.definitions);

  jobs.toArray = () => {
    const jobsCursor = jobs.find();
    return (0, _util.promisify)(jobsCursor.toArray).bind(jobsCursor)();
  };

  await jobs.toArray().then(jobsArray => Promise.all(jobsArray.map(job => (0, _job.defineJob)(job, jobs, agenda))));
  agenda.start();
  return jobs;
});
exports.jobsReady = jobsReady;

const getJobMiddleware = (jobAssertion, jobOperation, errorCode = 400) => async (ctx, next) => {
  const job = ctx.request.body || {};
  job.name = ctx.params.jobName || job.name;
  const jobs = await jobsReady;
  ctx.body = await (0, _job.promiseJobOperation)(job, jobs, agenda, jobAssertion, jobOperation).catch(err => ctx.throw(errorCode, err));
  await next();
};

router.get('/api/job', async (ctx, next) => {
  ctx.body = await jobsReady.then(jobs => jobs.toArray());
  await next();
});
router.post('/api/job', getJobMiddleware(_job.jobAssertions.notExists, _job.jobOperations.define));
router.del('/api/job/:jobName', getJobMiddleware(_job.jobAssertions.alreadyExists, _job.jobOperations.delete));
router.put('/api/job/:jobName', getJobMiddleware(_job.jobAssertions.alreadyExists, _job.jobOperations.define));
router.post('/api/job/once', getJobMiddleware(_job.jobAssertions.alreadyExists, _job.jobOperations.once));
router.post('/api/job/every', getJobMiddleware(_job.jobAssertions.alreadyExists, _job.jobOperations.every));
router.post('/api/job/now', getJobMiddleware(_job.jobAssertions.alreadyExists, _job.jobOperations.now));
router.post('/api/job/cancel', getJobMiddleware(_job.jobAssertions.doNotAssert, _job.jobOperations.cancel));

const graceful = () => {
  console.log('\nShutting down gracefully...');
  agenda.stop(() => {
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(0);
  });
};

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);
var _default = app;
exports.default = _default;

/***/ }),

/***/ "./src/job.js":
/*!********************!*\
  !*** ./src/job.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defineJob = exports.jobAssertions = exports.jobOperations = exports.promiseJobOperation = void 0;

var _querystring = _interopRequireDefault(__webpack_require__(/*! querystring */ "querystring"));

var _util = __webpack_require__(/*! util */ "util");

var _pythonic = __webpack_require__(/*! pythonic */ "pythonic");

var _requestPromise = _interopRequireDefault(__webpack_require__(/*! request-promise */ "request-promise"));

var _settings = _interopRequireDefault(__webpack_require__(/*! ../settings */ "../settings"));

var _util2 = __webpack_require__(/*! ./util */ "./src/util.js");

var _jobLogs = _interopRequireDefault(__webpack_require__(/*! ../model/jobLogs */ "./model/jobLogs.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getCheckJobFormatFunction = (jobProperty, defaultJob = {}) => job => {
  if (!job.name || jobProperty && !job[jobProperty]) {
    throw new Error(`expected request body to match {name${jobProperty ? `, ${jobProperty}` : ''}}`);
  }

  return Object.assign(defaultJob, job);
};

const doNotCheck = job => job;

const getAssertFunction = (assertOnCount, errorOnName) => async (job, jobs) => jobs.count({
  name: job.name
}).then(count => {
  if (!assertOnCount(count)) {
    throw new Error(errorOnName(job.name));
  }
});

const jobAssertions = {
  alreadyExists: getAssertFunction(count => count > 0, name => `Did not find a job named "${name}"`),
  notExists: getAssertFunction(count => count <= 0, name => `A job named "${name}" already exist`),
  doNotAssert: () => true
};
exports.jobAssertions = jobAssertions;

const defineJob = async ({
  name,
  url,
  method,
  callback
} = {}, jobs, agenda) => {
  agenda.define(name, (job, done) => {
    const {
      attrs: {
        data
      }
    } = job;
    let uri = url;

    for (const [key, value] of (0, _pythonic.keyValues)(data.params)) {
      uri = uri.replace(`:${key}`, value);
    }

    const query = _querystring.default.stringify(data.query);

    if (query !== '') {
      uri += `?${query}`;
    }

    Promise.race([new Promise((resolve, reject) => setTimeout(() => reject(new Error('TimeOutError')), _settings.default.timeout)), (0, _requestPromise.default)({
      method: method || 'POST',
      uri,
      body: data.body,
      headers: data.headers || {},
      json: true
    })]).catch(err => {
      new _jobLogs.default({
        jobName: job.attrs.name,
        status: "failed",
        result: JSON.stringify(err.message),
        jobInfo: JSON.stringify(job.attrs)
      }).save(function (saveErr, log) {
        job.fail(saveErr);
      });
      job.fail(err.message);
      return {
        error: err.message
      };
    }).then(result => {
      new _jobLogs.default({
        jobName: job.attrs.name,
        status: "success",
        result: JSON.stringify(result),
        jobInfo: JSON.stringify(job.attrs)
      }).save(function (saveErr, log) {
        job.fail(saveErr);
      });

      if (callback) {
        return (0, _requestPromise.default)({
          method: callback.method || 'POST',
          uri: callback.url,
          headers: callback.headers || {},
          body: {
            data: data.body,
            response: result
          },
          json: true
        });
      }
    }).catch(err => {
      job.fail(`failure in callback: ${err.message}`);
      new _jobLogs.default({
        jobName: job.attrs.name,
        status: "failed",
        result: `failure in callback: ${err.message}`,
        jobInfo: JSON.stringify(job.attrs)
      }).save(function (saveErr, log) {
        job.fail(saveErr);
      });
    }).then(() => done());
  });
  await jobs.count({
    name
  }).then(count => count < 1 ? jobs.insert({
    name,
    url,
    method,
    callback
  }) : jobs.update({
    name
  }, {
    $set: {
      url,
      method,
      callback
    }
  }));
  return 'job defined';
};

exports.defineJob = defineJob;

const deleteJob = async (job, jobs, agenda) => {
  const cancel = (0, _util.promisify)(agenda.cancel).bind(agenda);
  const numRemoved = await cancel(job);
  const obj = await jobs.remove(job);
  return `removed ${numRemoved} job definitions and ${obj.result.n} job instances.`;
};

const cancelJob = async (job, jobs, agenda) => {
  const numRemoved = await (0, _util.promisify)(agenda.cancel).bind(agenda)(job);
  return `${numRemoved} jobs canceled`;
};

const getDefaultJobForSchedule = () => ({
  data: {
    body: {},
    params: {},
    query: {}
  }
});

const scheduleTypes = {
  now: {
    method: agenda => (0, _util.promisify)(agenda.now).bind(agenda),
    message: 'for now',
    getParams: job => [job.name, job.data]
  },
  once: {
    method: agenda => (0, _util.promisify)(agenda.schedule).bind(agenda),
    message: 'for once',
    getParams: job => {
      // Check if interval is timestamp
      let time = parseInt(job.interval, 10);
      time = isNaN(time) ? job.interval : time; // Check if interval is date

      time = new Date(time);
      time = (0, _util2.isValidDate)(time) ? time : job.interval;
      return [time, job.name, job.data];
    }
  },
  every: {
    method: agenda => (0, _util.promisify)(agenda.every).bind(agenda),
    message: 'for repetition',
    getParams: job => [job.interval, job.name, job.data]
  }
};

const getScheduleJobFunction = scheduleType => async (job, jobs, agenda) => {
  await scheduleType.method(agenda)(...scheduleType.getParams(job));
  return `job scheduled ${scheduleType.message}`;
};

const getJobOperation = (checkFunction, jobFunction) => ({
  check: checkFunction,
  fn: jobFunction
});

const jobOperations = {
  define: getJobOperation(getCheckJobFormatFunction('url'), defineJob),
  delete: getJobOperation(getCheckJobFormatFunction(), deleteJob),
  cancel: getJobOperation(doNotCheck, cancelJob),
  now: getJobOperation(getCheckJobFormatFunction(false, getDefaultJobForSchedule()), getScheduleJobFunction(scheduleTypes.now)),
  once: getJobOperation(getCheckJobFormatFunction('interval', getDefaultJobForSchedule()), getScheduleJobFunction(scheduleTypes.once)),
  every: getJobOperation(getCheckJobFormatFunction('interval', getDefaultJobForSchedule()), getScheduleJobFunction(scheduleTypes.every))
};
exports.jobOperations = jobOperations;

const promiseJobOperation = async (job, jobs, agenda, jobAssertion, jobOperation) => {
  job = await jobOperation.check(job);
  await jobAssertion(job, jobs);
  return jobOperation.fn(job, jobs, agenda);
};

exports.promiseJobOperation = promiseJobOperation;

/***/ }),

/***/ "./src/util.js":
/*!*********************!*\
  !*** ./src/util.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isValidDate = exports.bootstrapKoaApp = void 0;

var _koa = _interopRequireDefault(__webpack_require__(/*! koa */ "koa"));

var _koaLogger = _interopRequireDefault(__webpack_require__(/*! koa-logger */ "koa-logger"));

var _koaRouter = _interopRequireDefault(__webpack_require__(/*! koa-router */ "koa-router"));

var _koaBodyparser = _interopRequireDefault(__webpack_require__(/*! koa-bodyparser */ "koa-bodyparser"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const bootstrapKoaApp = () => {
  const app = new _koa.default();
  const router = new _koaRouter.default();
  app.use((0, _koaLogger.default)());
  app.use(async (ctx, next) => next().catch(err => {
    console.dir(err);
    ctx.body = String(err);
    ctx.status = err.status || 500;
  }));
  app.use((0, _koaBodyparser.default)({
    onerror(error, ctx) {
      ctx.throw(400, `cannot parse request body, ${JSON.stringify(error)}`);
    }

  }));
  app.use(router.routes());
  return {
    app,
    router
  };
};

exports.bootstrapKoaApp = bootstrapKoaApp;

const isValidDate = date => Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());

exports.isValidDate = isValidDate;

/***/ }),

/***/ "./test.js":
/*!*****************!*\
  !*** ./test.js ***!
  \*****************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {
  promisify
} = __webpack_require__(/*! util */ "util");

const test = __webpack_require__(/*! ava */ "ava");

const request = __webpack_require__(/*! supertest */ "supertest");

const {
  bootstrapKoaApp
} = __webpack_require__(/*! ./src/util */ "./src/util.js");

const agendaAppUrl = 'http://localhost:4041';
const testAppUrl = 'http://localhost:4042';
const {
  app: testApp,
  router: testAppRouter
} = bootstrapKoaApp();

const getTestAppUrl = path => path ? `${testAppUrl}${path}` : testAppUrl;

const agendaAppRequest = request(agendaAppUrl);
testAppRouter.post('/foo', async (ctx, next) => {
  console.log('foo invoked!');
  ctx.body = 'foo success';
  ctx.status = 200;
  await next();
});
testAppRouter.post('/foo/:fooParam', async (ctx, next) => {
  console.log('foo with params invoked!');
  console.log(ctx.params);
  console.log(ctx.request.body);
  ctx.body = 'foo with params success';
  ctx.status = 200;
  await next();
});
testAppRouter.post('/foo/cb', async (ctx, next) => {
  console.log('foo callback invoked!');
  ctx.body = 'foo callback success';
  ctx.status = 200;
  await next();
});

const bootstrapApp = async () => {
  const {
    app,
    jobsReady
  } = __webpack_require__(/*! ./src */ "./src/index.js");

  await promisify(app.listen).bind(app)(4041).then(() => console.log('agenda-rest app running'));
  await promisify(testApp.listen).bind(testApp)(4042).then(() => console.log('test app running'));
  await jobsReady;
};

test.before(() => bootstrapApp());
test.serial('POST /api/job fails without content', async t => {
  const res = await agendaAppRequest.post('/api/job').send();
  t.is(res.status, 400);
});
test.serial('POST /api/job succeeds when a job is specified', async t => {
  const res = await agendaAppRequest.post('/api/job').send({
    name: 'foo',
    url: getTestAppUrl('/foo')
  });
  t.is(res.status, 200);
});
test.serial('DELETE /api/job succeeds when a job is defined', async t => {
  const res = await agendaAppRequest.delete('/api/job/foo');
  t.is(res.status, 200);
});

/***/ }),

/***/ "agenda":
/*!*************************!*\
  !*** external "agenda" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("agenda");

/***/ }),

/***/ "ava":
/*!**********************!*\
  !*** external "ava" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("ava");

/***/ }),

/***/ "koa":
/*!**********************!*\
  !*** external "koa" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("koa");

/***/ }),

/***/ "koa-bodyparser":
/*!*********************************!*\
  !*** external "koa-bodyparser" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("koa-bodyparser");

/***/ }),

/***/ "koa-logger":
/*!*****************************!*\
  !*** external "koa-logger" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("koa-logger");

/***/ }),

/***/ "koa-router":
/*!*****************************!*\
  !*** external "koa-router" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("koa-router");

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("mongoose");

/***/ }),

/***/ "pythonic":
/*!***************************!*\
  !*** external "pythonic" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("pythonic");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("querystring");

/***/ }),

/***/ "request-promise":
/*!**********************************!*\
  !*** external "request-promise" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("request-promise");

/***/ }),

/***/ "supertest":
/*!****************************!*\
  !*** external "supertest" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("supertest");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ })

/******/ });
});
//# sourceMappingURL=test.js.map