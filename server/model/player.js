const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let PlayerSchema = new Schema(
    {
        player: {
            type: String,
            required: true,
            unique: true
        },
        team: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: [
                'goalkeeper',
                'defender',
                'midfielder',
                'forward'
            ],
            required: true
        },
        assigned: {
            type: Boolean,
            default: false
        },
        currentOffer: {
            type: Number,
            default: 0
        },
        currentOwner: {
            type: String,
        },
        finalOffer: {
            type: Number
        },
        finalOwner: {
            type: String,
        },
    }
);

module.exports = mongoose.model("Player", PlayerSchema);