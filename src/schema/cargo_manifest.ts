// let m =  require('mongoose')
import m from 'mongoose'
import populate from 'mongoose-autopopulate';
let Schema = m.Schema
let CargoManifestSch = new m.Schema({
    awb_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'airway_bill'},
    awb_number:String, 
    origin:{type: Schema.Types.ObjectId, autopopulate:true, ref:'airport'},
    dest:{type: Schema.Types.ObjectId, autopopulate:true, ref:'airport'},
    uld:String,
    flight_schedule_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'flight_schedule'},
    flight_number:String,
    flight_date:String,
    flight_origin:{type: Schema.Types.ObjectId, autopopulate:true, ref:'airport'},
    flight_dest:{type: Schema.Types.ObjectId, autopopulate:true, ref:'airport'},
    is_transit:{type:Boolean, default:false},
    createdBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    createdAt:{type:Date, default:Date.now},
    deleted:{type:Number, default:0},
    deletedBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    deletedAt:{type:Date},
})

CargoManifestSch.index({awb_id:1});
CargoManifestSch.index({awb_number:1});
CargoManifestSch.index({flight_schedule_id:1});
CargoManifestSch.index({flight_number:1});
CargoManifestSch.index({flight_date:1});
CargoManifestSch.plugin(populate);

module.exports = m.model('cargo_manifest',CargoManifestSch);