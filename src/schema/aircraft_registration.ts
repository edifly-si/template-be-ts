import m from 'mongoose';
import populate from 'mongoose-autopopulate';
const AircraftSchema = new m.Schema({
    airline_id:{type: m.Schema.Types.ObjectId, autopopulate:true, ref:'airline'},  
    aircraft_registration: String,
    aircraft_id:{type: m.Schema.Types.ObjectId, autopopulate:true, ref:'aircraft'},  
    // last_park_stand: String,
    flight_type: { type: String, default: 'PAX' },
    aircraft_type: String,
    mtow: Number,
    faktor_berat: Number,
    // customer_id: { type: m.Schema.Types.ObjectId, autopopulate: true, ref: 'customer' },
    // aircraft_type_id:{type: m.Schema.Types.ObjectId, autopopulate:true, ref:'aircraft_type'},      
    createdBy: { type: m.Schema.Types.ObjectId, autopopulate: { select: 'username name email' }, ref: 'user' },
    createdAt: { type: Date, default: Date.now },
    deleted: { type: Number, default: 0 },
    deletedBy: { type: m.Schema.Types.ObjectId, autopopulate: { select: 'username name email' }, ref: 'user' },
    deletedAt: { type: Date },
});

AircraftSchema.index({aircraft_registration:1},{unique:true});
AircraftSchema.plugin(populate);

export default m.model('aircraft_registration',AircraftSchema);