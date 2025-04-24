// let m =  require('mongoose')
import m, {Schema} from 'mongoose'
import populate from 'mongoose-autopopulate';
// let Schema = m.Schema
let PassengerListSch = new m.Schema({
    flight_record_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'flight_schedule'},
    transfer_from:{
        flight_record_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'flight_schedule'},
        flight_number:String,
        flight_date_str:String
    },
    transfer_to:{
        flight_record_id:{type: Schema.Types.ObjectId, autopopulate:true, ref:'flight_schedule'},
        flight_number:String,
        flight_date_str:String
    },
    remarks:{type:Schema.Types.Mixed},
    origin:{type: Schema.Types.ObjectId, autopopulate:true, ref:'airport'},
    dest:{type: Schema.Types.ObjectId, autopopulate:true, ref:'airport'},
    ticket_class:String,
    name:String,
    firstname:String,
    lastname:String,
    title:String,
    pnr:String,
    seat:String,
    ticket_number:String,
    // smi:[String],
    pax_status:{type:String, default:'direct'},
    baggages:{
        kilo:Number,
        koli:Number,
        barcode:[{barcode:String, dest:String, kilo:Number, koli:Number}],
        ebt_number: Number,
    },
    pdf417_barcode:String,
    seq:{type:Number, default:0},
    status:{type:String, default:''},
    passport_number:String,
    passport_expiry:String,
    passport_issuing_cty:String,
    dob:String,
    gender:String,
    nationality:String,
    checkin_time:{type:Date}, // only by kiosk
    boarding_time:{type:Date},
    deleted:{type:Number, default:0},
    deletedBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    deletedAt:{type:Date},
});

PassengerListSch.index({flight_record_id:1});
PassengerListSch.index({name:1}); 
PassengerListSch.index({name:1, pnr:1, flight_record_id:1}, {unique:true}); 
PassengerListSch.plugin(populate);

module.exports = m.model('passenger_list',PassengerListSch);