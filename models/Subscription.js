const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    subscription: {
        type: Object,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
