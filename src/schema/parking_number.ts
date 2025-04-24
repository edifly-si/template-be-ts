// let m =  require('mongoose')
import m from 'mongoose'
import populate from 'mongoose-autopopulate';
let Schema = m.Schema
let ParkingStandSch = new m.Schema({
    code:String,
    parking_number:String,
    avio_bridge_number:String,
    createdBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    createdAt:{type:Date, default:Date.now},
    deleted:{type:Number, default:0},
    deletedBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    deletedAt:{type:Date},
})

ParkingStandSch.index({code:1},{unique:true});
ParkingStandSch.plugin(populate);

module.exports = m.model('parking_stand',ParkingStandSch);