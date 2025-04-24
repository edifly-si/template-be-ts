// let m =  require('mongoose')
import m from 'mongoose'
import populate from 'mongoose-autopopulate';
let Schema = m.Schema
let AvioHistorySch = new m.Schema({
    parking_stand:{type: Schema.Types.ObjectId, autopopulate:true, ref:'parking_stand'},
    movement_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'aircraft_movement'},
    docking_time:Date,
    undocking_time:Date,
    docking_by:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    undocking_by:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    createdBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    createdAt:{type:Date, default:Date.now},
    deleted:{type:Number, default:0},
    deletedBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    deletedAt:{type:Date},
})

AvioHistorySch.index({movement_id:1},{unique:true});
AvioHistorySch.plugin(populate);

module.exports = m.model('avio_history',AvioHistorySch);