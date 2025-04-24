import m, {Schema} from 'mongoose'
import populate from 'mongoose-autopopulate';
let CustomerSch = new m.Schema({
    code:String,
    name:String,    
    company_name:String,
    address:String,
    is_aero:{type:Boolean, default:true},
    createdBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    createdAt:{type:Date, default:Date.now},
    deleted:{type:Number, default:0},
    deletedBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    deletedAt:{type:Date},
})

CustomerSch.index({code:1},{unique:true});
CustomerSch.plugin(populate);

module.exports = m.model('customer',CustomerSch);