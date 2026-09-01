import m from 'mongoose';
import populate from 'mongoose-autopopulate';

const sch = new m.Schema({
    userId: {
        type: m.Schema.Types.ObjectId,
        autopopulate: { select: 'username name email' },
        ref: 'user',
    },
    ipAddress: String,
    log: String,
    createdAt: { type: Date, default: Date.now },
});

sch.index({ userId: 1 });
sch.index({ ipAddress: 1 });
sch.plugin(populate);

export default m.model('activity_log', sch);
