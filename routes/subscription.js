const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');

// 구독 저장
router.post('/save-subscription', async (req, res) => {
    const subscription = req.body;

    try {
        await Subscription.create({ subscription });
        res.status(201).json({ message: 'Subscription saved successfully' });
    } catch (error) {
        console.error('Subscription Save Error:', error);
        res.status(500).json({ error: 'Failed to save subscription' });
    }
});

module.exports = router;
