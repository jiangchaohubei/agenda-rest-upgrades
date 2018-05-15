import mongoose from 'mongoose';
import './mongo'
const Schema=mongoose.Schema;

const jobLogsSchema=new Schema({
  "jobName":{type:String},
  "status":String,
  "runAt":{type:Date,default:new Date()},
  "result":String,
  "jobInfo":String

})

export default mongoose.model('jobLogs',jobLogsSchema);