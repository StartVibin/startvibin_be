import mongoose, { Document, Schema } from 'mongoose'

export interface IStringStore extends Document {
  key: string
  value: string
}

const stringStoreSchema = new Schema<IStringStore>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
)

const StringStore = mongoose.model<IStringStore>('StringStore', stringStoreSchema)

export default StringStore 