import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  key: { type: String, required: true },
  on: { type: Boolean, default: true },
})

schema.index({ user: 1, key: 1 }, { unique: true })

export default mongoose.model('NotificationPreference', schema)