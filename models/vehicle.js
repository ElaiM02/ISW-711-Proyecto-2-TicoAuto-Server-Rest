const mongoose = require('mongoose');
const vehicleSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String, maxlength: 500 },
  image: { type: String },
  status: { 
    type: String, 
    enum: ['available', 'sold'], 
    default: 'available' 
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });


module.exports = mongoose.model('Vehicle', vehicleSchema);