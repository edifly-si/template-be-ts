// let m =  require('mongoose')
import m from 'mongoose'
import populate from 'mongoose-autopopulate';
let Schema = m.Schema
let AirlineSch = new m.Schema({
    code:String,
    name:String,    
    icao:String,
    country:String,
    callsign:String,
    company_name:String,
    prefix:String,
    customer_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'customer'},
    createdBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    createdAt:{type:Date, default:Date.now},
    deleted:{type:Number, default:0},
    deletedBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    deletedAt:{type:Date},
})

AirlineSch.index({code:1},{unique:true});
AirlineSch.plugin(populate);

module.exports = m.model('airline',AirlineSch);