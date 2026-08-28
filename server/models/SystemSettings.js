const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  commitPoints: { type: Number, default: 1 },
  prPoints: { type: Number, default: 5 },
  mergedPrPoints: { type: Number, default: 7 },
  issuePoints: { type: Number, default: 2 },
  reviewPoints: { type: Number, default: 3 },
  inactivityThresholdDays: { type: Number, default: 14 },
  autoSyncFrequencyHours: { type: Number, default: 24 },
  updatedAt: { type: Date, default: Date.now }
});

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
module.exports = SystemSettings;
