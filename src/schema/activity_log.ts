import m from 'mongoose';
import populate from 'mongoose-autopopulate';

const sch = new m.Schema({
    user_id: {
        type: m.Schema.Types.ObjectId,
        autopopulate: { select: 'username name email' },
        ref: 'user',
    },
    ip_address: String,
    log: String,
    createdAt: { type: Date, default: Date.now },
});

sch.index({ user_id: 1 });
sch.index({ ip_address: 1 });
sch.plugin(populate);

export default m.model('activity_log', sch);
