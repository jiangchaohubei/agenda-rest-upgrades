import querystring from 'querystring';
import {promisify} from 'util';
import {keyValues} from 'pythonic';
import rp from 'request-promise';
import settings from '../settings';
import {isValidDate} from './util';
import jobLogs from '../model/jobLogs';

const getCheckJobFormatFunction = (jobProperty, defaultJob = {}) => job => {
  if (!job.name || (jobProperty && !job[jobProperty])) {
    throw new Error(`expected request body to match {name${jobProperty ? `, ${jobProperty}` : ''}}`);
  }
  return Object.assign(defaultJob, job);
};

const doNotCheck = job => job;

const getAssertFunction = (assertOnCount, errorOnName) => async (job, jobs) => jobs.count({name: job.name})
  .then(count => {
    if (!assertOnCount(count)) {
      throw new Error(errorOnName(job.name));
    }
  });

const jobAssertions = {
  alreadyExists: getAssertFunction(count => count > 0, name => `Did not find a job named "${name}"`),
  notExists: getAssertFunction(count => count <= 0, name => `A job named "${name}" already exist`),
  doNotAssert: () => true
};

const defineJob = async ({name, url, method, callback} = {}, jobs, agenda) => {
  agenda.define(name, (job, done) => {

    const {attrs: {data}} = job;

    let uri = url;
    for (const [key, value] of keyValues(data.params)) {
      uri = uri.replace(`:${key}`, value);
    }
    const query = querystring.stringify(data.query);
    if (query !== '') {
      uri += `?${query}`;
    }
    Promise.race([
      new Promise((resolve, reject) => setTimeout(() => reject(new Error('TimeOutError')), settings.timeout)),
      rp({
        method: method || 'POST',
        uri,
        body: data.body,
        headers: data.headers || {},
        json: true
      })
    ])
      .catch(err => {

        new jobLogs({
          jobName:job.attrs.name,
          status:"failed",
          result:JSON.stringify(err.message),
          jobInfo:JSON.stringify(job.attrs)
        }).save(function (saveErr,log) {
          job.fail(saveErr);
        })
        job.fail(err.message);
        return {error: err.message};
      })
      .then(result => {
        new jobLogs({
          jobName:job.attrs.name,
          status:"success",
          result:JSON.stringify(result),
          jobInfo:JSON.stringify(job.attrs)
        }).save(function (saveErr,log) {
          job.fail(saveErr);
        })
        if (callback.url) {
          return rp({
            method: callback.method || 'POST',
            uri: callback.url,
            headers: callback.headers || {},
            body: {data: data.body, response: result},
            json: true
          });
        }
      })
      .catch(err => {
        job.fail(`failure in callback: ${err.message}`)
        new jobLogs({
          jobName:job.attrs.name,
          status:"failed",
          result:`failure in callback: ${err.message}`,
          jobInfo:JSON.stringify(job.attrs)
        }).save(function (saveErr,log) {
          job.fail(saveErr);
        })
      })
      .then(() => done());
  });

  await jobs.count({name})
    .then(count => count < 1 ? jobs.insert({name, url, method, callback}) : jobs.update({name}, {$set: {url, method, callback}}));

  return 'job defined';
};

const deleteJob = async (job, jobs, agenda) => {
  const cancel = promisify(agenda.cancel).bind(agenda);
  const numRemoved = await cancel(job);
  const obj = await jobs.remove(job);
  return `removed ${numRemoved} job definitions and ${obj.result.n} job instances.`;
};

const cancelJob = async (job, jobs, agenda) => {
  const numRemoved = await promisify(agenda.cancel).bind(agenda)(job);
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
    method: agenda => promisify(agenda.now).bind(agenda),
    message: 'for now',
    getParams: job => [job.name, job.data]
  },
  once: {
    method: agenda => promisify(agenda.schedule).bind(agenda),
    message: 'for once',
    getParams: job => {
      // Check if interval is timestamp
      let time = parseInt(job.interval, 10);
      time = isNaN(time) ? job.interval : time;
      // Check if interval is date
      time = new Date(time);
      time = isValidDate(time) ? time : job.interval;
      return [time, job.name, job.data];
    }
  },
  every: {
    method: agenda => promisify(agenda.every).bind(agenda),
    message: 'for repetition',
    getParams: job => [job.interval, job.name, job.data]
  }
};

const getScheduleJobFunction = scheduleType => async (job, jobs, agenda) => {
  await scheduleType.method(agenda)(...scheduleType.getParams(job));
  return `job scheduled ${scheduleType.message}`;
};

const getJobOperation = (checkFunction, jobFunction) => ({check: checkFunction, fn: jobFunction});

const jobOperations = {
  define: getJobOperation(getCheckJobFormatFunction('url'), defineJob),
  delete: getJobOperation(getCheckJobFormatFunction(), deleteJob),
  cancel: getJobOperation(doNotCheck, cancelJob),
  now: getJobOperation(
    getCheckJobFormatFunction(false, getDefaultJobForSchedule()),
    getScheduleJobFunction(scheduleTypes.now)
  ),
  once: getJobOperation(
    getCheckJobFormatFunction('interval', getDefaultJobForSchedule()),
    getScheduleJobFunction(scheduleTypes.once)
  ),
  every: getJobOperation(
    getCheckJobFormatFunction('interval', getDefaultJobForSchedule()),
    getScheduleJobFunction(scheduleTypes.every)
  )
};

const promiseJobOperation = async (job, jobs, agenda, jobAssertion, jobOperation) => {
  job = await jobOperation.check(job);
  await jobAssertion(job, jobs);
  return jobOperation.fn(job, jobs, agenda);
};

export {
  promiseJobOperation,
  jobOperations,
  jobAssertions,
  defineJob
};
