// let m =  require('mongoose')
import m from 'mongoose'
import populate from 'mongoose-autopopulate';

let Schema = m.Schema
let AWBSch = new m.Schema({
    msg_source:{type: Schema.Types.ObjectId, autopopulate:true, ref:'typeb'},
    is_import:{type:Boolean, default:false},
    is_export:{type:Boolean, default:false},
    awb_id:String,
    awb_number:String,
    origin:String,
    dest:String,
    flight_details:[{
        flight_number:String,
        flight_date:String
    }],
    shipment_detail:{
        accepted_total:{type:Number, default:0},
        ra_total:{type:Number, default:0},
        ra_kilo:{type:Number, default:0},
        total:{type:Number, default:0},
        split:{type:Number, default:0},
        part:{type:Number, default:0},
        kilo:{type:Number, default:0},
        charged_kilo:{type:Number, default:0},
        volume:{type:Number, default:0},
        before_kilo:{type:Number, default:0},
        before_total:{type:Number, default:0},
    },
    routing:[
        {
            airline:String,
            airport:String
        }
    ],
    shipper:{
        account_number:String,
        name:String,
        address:String,
        location:String,
        country_code:String,
        post_code:String,
        contact_identifier:String,
        contact_number:String,                
    },
    consigne:{
        account_number:String,
        name:String,
        address:String,
        location:String,
        country_code:String,
        post_code:String,
        contact_identifier:String,
        contact_number:String
    },
    agent:{
        account_number:String,
        iata_cargo_agent_num_code:String,
        name:String,
        place:String
    },
    ssr:[String],
    charge_declaration:{
        currency_code:String,
        charge_code:String,
        collect_charge_declaration:String,
        value_for_carried_declaration:String,
        value_for_custom_declaration:String,
        value_for_insurance_declaration:String
    },
    rate:{
        awb_rate_line_number:Number,
        number_of_pieces:Number,
        gross_weight:Number,
        gross_weight_code:String,
        class_code:String,
        rate_charges:Number,
        chargable_weight_detail:Number,
        total_charges:Number,
        description:[{
            code:String,
            desc:[String],
        }]        
    },
    prepaid_charges_summary:{
        total_weight_charges:{type:Number,default:0},
        valuation_charges:{type:Number, default:0},
        taxes_charges:{type:Number, default:0},
        others_agent_charges:{type:Number, default:0},
        others_carrier_charges:{type:Number, default:0},
        summary_total_charges:{type:Number, default:0},
    },
    shipper_certification:String,
    issue_detail:{
        issued_date:{type:String},
        place:String,
        authorisation:String,
    },
    reference:{
        office_message_address:String,
        office_file_ref:String,
        participant_identification:{
            identifier:String,
            code:String,
            airport:String
        }
    },
    osi:[String],
    other_charge:[
        {
            charge_line:String,
            charge_code:String,
            entitlement_code:String,
            charge_amount:Number
        }
    ],
    special_handling_request:[String],
    detail:[{
        num:Number,
        width:Number,
        length:Number,
        height:Number,
        pcs:Number,
        weight:Number
    }],    
    createdBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    createdAt:{type:Date, default:Date.now},
    createdTime:{type:Date, default:Date.now},
    deleted:{type:Number, default:0},
    deletedBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    deletedAt:{type:Date},
})

AWBSch.index({awb_number:1});
AWBSch.plugin(populate);

module.exports = m.model('airway_bill',AWBSch);