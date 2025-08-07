import mongoose from 'mongoose'

const thermocoupleHistorySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  data: {
    type: Array,
    required: true
  }
})

const ThermocoupleHistory = mongoose.model('ThermocoupleHistory', thermocoupleHistorySchema)

export default ThermocoupleHistory
