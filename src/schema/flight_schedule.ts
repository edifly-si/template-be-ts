import m, {Schema} from 'mongoose';
import populate from 'mongoose-autopopulate';
let FlightScheduleSch = new m.Schema({
    flight_number:String,
    flight_date:{type:Date},
    flight_date_str:String,
    aircraft_registration:String,
    aircraft_registration_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'aircraft_registration'},
    from:{type: Schema.Types.ObjectId, autopopulate:true, ref:'airport'},
    to:{type: Schema.Types.ObjectId, autopopulate:true, ref:'airport'},
    unix_std:Number,
    unix_sta:Number,
    unix_atd:Number,
    unix_ata:Number,
    unix_etd:Number,
    unix_eta:Number,
    unix_blockon:Number,
    unix_blockoff:Number,
    current_status:String,
    std:String,
    sta:String,
    etd:String,
    eta:String,
    atd:String, //mvt
    ata:String, //mvt
    block_on:String, //mvt
    block_off:String, //mvt
    plan_std:String,
    plan_sta:String,
    parking_position:String,
    gate:String,
    checkin_counter:String,
    conveyor_belt:String,
    delay:[
        {
            code:String,
            time:String
        }
    ],
    local_etd:Date,
    local_eta:Date,    
    allocation_plan_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'allocation_plan'},
    is_canceled:{type:Boolean, default:false},
    canceledBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    canceledAt:{type:Date},
    departureTerminal:String,
    departureGate:String, 
    arrivalTerminal:String, 
    arrivalGate:String, 
    is_international:{type:Boolean, default:false},
    aircraft_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'aircraft'},
    // periode_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'flight_periode'}, //ilang / null di sini kalo unschedule
    is_unschedule:{type:Boolean, default:false},
    createdBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    createdAt:{type:Date, default:Date.now},
    deleted:{type:Number, default:0},
    deletedBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    deletedAt:{type:Date},
})

FlightScheduleSch.index({flight_number_id:1, flight_date_str:1, aircraft_registration:1},{unique:true});
FlightScheduleSch.index({flight_date_str:1});
FlightScheduleSch.index({flight_number:1, flight_date_str:1});
FlightScheduleSch.plugin(populate);

module.exports = m.model('flight_schedule', FlightScheduleSch);