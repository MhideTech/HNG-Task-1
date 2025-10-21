import mongoose from "mongoose";

const stringModel = new mongoose.Schema({
  id: String,
  value: {
    type: String,
    required: true,
    unique: true,
  },
  properties: {
    length: Number,
    is_palindrome: Boolean,
    unique_characters: Number,
    word_count: Number,
    sha256_hash: String,
    character_frequency_map: Object,
  },
  created_at: String,
});

export default mongoose.model("Strings", stringModel);
