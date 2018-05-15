import mongoose from 'mongoose';
import './mongo'
const Schema=mongoose.Schema;

let jobLogsSchema=new Schema({
  "jobName":{type:String},
  "status":String,
  "runAt":{type:Date,default:new Date()},
  "result":String,
  "jobInfo":String

})

module.exports=mongoose.model('jobLogs',jobLogsSchema);
