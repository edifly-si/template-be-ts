import m from 'mongoose';
import populate from 'mongoose-autopopulate';

const sch = new m.Schema(
    {
        username: { type: String, required: true },
        password: { type: String, required: true },
        name: { type: String, required: true },
        level: { type: String, required: true },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        lastLogin: { type: Date },
        createdBy: {
            type: m.Schema.Types.ObjectId,
            autopopulate: { select: 'username name email' },
            ref: 'user',
        },
    },
    {
        timestamps: true,
    }
);

sch.index({ username: 1 }, { unique: true });
sch.index({ level: 1 });
sch.plugin(populate);

export default m.model('user', sch);
