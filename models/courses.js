const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    destination: {
        type: String,
        required: true
    },
    montant: {
        type: Number,
        required: true
    },
    chauffeur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chauffeur',
        required: true
    },
    statut: {
        type: String,
        enum: ['en attente', 'en cours', 'terminée'],
        default: 'en attente'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Course', courseSchema);