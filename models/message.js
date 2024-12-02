import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        room: { type: String, required: true },
        sender: { type: String, required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;  // Export the Message model as default
