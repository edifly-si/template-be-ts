import m, {Schema} from 'mongoose'
import populate from 'mongoose-autopopulate';
let AllocPlanSch = new m.Schema({
    flight_date_str:String,
    arrival_flight_schedule_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'flight_schedule'}, 
    departure_flight_schedule_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'flight_schedule'}, 
    arrival_flight_number:String,
    departure_flight_number:String,
    origin_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'airport'},
    dest_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'airport'},
    sta:{type:String, default:''},
    std:{type:String, default:''},   
    block_on_time:{type:Date},
    block_off_time:{type:Date},
    docking_time:{type:Date},
    undocking_time:{type:Date},
    actual_arrival_time:{type:Date},
    actual_departure_time:{type:Date},
    unix_sta:Number, 
    unix_std:Number,
    nature:{type:String, default:''},
    arrival_acreg_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'aircraft_registration'},
    departure_acreg_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'aircraft_registration'},
    arrival_pos:{type:Schema.Types.ObjectId, autopopulate:true, ref:'parking_stand'},
    departure_pos:{type:Schema.Types.ObjectId, autopopulate:true, ref:'parking_stand'},
    arrival_gate:{type:String, default:''},
    departure_gate:{type:String, default:''},
    conveyor_belt:{type:String, default:''},
    counter:{type:String, default:''},
    is_canceled:{type:Boolean, default:false},
    requestBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'airline_user'},
    createdBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    createdAt:{type:Date, default:Date.now},
    deleted:{type:Number, default:0},
    deletedBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    deletedAt:{type:Date},
})

AllocPlanSch.index({flight_date_str:1});
AllocPlanSch.plugin(populate);

module.exports = m.model('allocation_plan',AllocPlanSch);