// let m =  require('mongoose')
import m from 'mongoose'
import populate from 'mongoose-autopopulate';
let Schema = m.Schema
let AirportSch = new m.Schema({
    code:String,
    icao_code:String,
    name:{type:String, default:''},
    provinsi:{type:String},
    kota:{type:String, default:''},
    country:{type:String, default:'ID'},
    country_name:{type:String, default:'Indonesia'},
    pnr:{type:Number, default:0},
    lat:Number,
    lon:Number,
    elevation:Number,
    timezone:String,
    unix_offset:{type:Number, default:0},
    createdBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    createdAt:{type:Date, default:Date.now},
    deleted:{type:Number, default:0},
    deletedBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    deletedAt:{type:Date},
})

AirportSch.index({code:1},{unique:true});
AirportSch.plugin(populate);

module.exports = m.model('airport',AirportSch);