import m, {Schema} from 'mongoose'
import populate from 'mongoose-autopopulate';
const AircraftSch = new m.Schema({
    name:String,    
    aircraft_type:String,
    iata_code:String,
    createdBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    createdAt:{type:Date, default:Date.now},
    deleted:{type:Number, default:0},
    deletedBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    deletedAt:{type:Date},
})

AircraftSch.plugin(populate);

module.exports = m.model('aircraft', AircraftSch);