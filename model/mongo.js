import mongoose from 'mongoose';
import settings from '../settings';

mongoose.connect(settings.agendaMongoUrl,(err,db)=>{
  if(!err){
    console.log('数据库连接成功')
  }else{
    console.log('数据库连接失败')
  }
})
