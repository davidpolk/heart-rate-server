const db = require("../db");

// Measurement Schema
const measurementSchema = new db.Schema({
    deviceName: { type: String, required: true }, // Link measurement to a specific device
    heartRate: { 
        type: Number, 
        required: true, 
        min: 30,  // Typical minimum heart rate for a human
        max: 250  // Typical maximum heart rate for a human
    },
    oxygenSaturation: { 
        type: Number, 
        required: true, 
        min: 0,  // Minimum valid oxygen saturation percentage
        max: 100 // Maximum valid oxygen saturation percentage
    },
    timestamp: { type: Date, default: Date.now }, // When the measurement was taken
});

const Measurement = db.model('Measurement', measurementSchema);

module.exports = Measurement;