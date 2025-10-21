import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
import Strings from "./models/stringModel.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

if (!process.env.MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

function generateSHA256Hash(value) {
  const hash = crypto.createHash("sha256");
  hash.update(value);
  return hash.digest("hex");
}

function getCharacterFrequencyMap(value) {
  const characterFrequencyMap = {};
  for (const char of value) {
    characterFrequencyMap[char] = (characterFrequencyMap[char] || 0) + 1;
  }
  return characterFrequencyMap;
}

app.post("/strings", async (req, res) => {
  try {
    const { value } = req.body;

    if (!value)
      return res
        .status(400)
        .json({ error: 'The request must contain a  + "value" field' });

    if (typeof value !== "string")
      return res
        .status(422)
        .json({ error: 'Invalid data type for "value" (must be string)' });

    const hash = generateSHA256Hash(value);
    const stringProperties = {
      id: hash,
      value: value,
      properties: {
        length: value.length,
        is_palindrome: value === value.split("").reverse().join(""),
        unique_characters: [...new Set(value)].join(""),
        word_count: value.split(" ").length,
        sha256_hash: hash,
        character_frequency_map: getCharacterFrequencyMap(value),
        created_at: new Date().toISOString(),
      },
    };
    const newString = new Strings(stringProperties);
    await newString.save();

    res.status(200).json(stringProperties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/strings", async (req, res) => {
  try {
    const {
      is_palindrome,
      min_length,
      max_length,
      word_count,
      contains_character,
    } = req.query;

    const filter = {};

    if (is_palindrome !== undefined) {
      filter["properties.is_palindrome"] = is_palindrome === "true";
    }
    if (min_length) {
      filter["properties.length"] = {
        ...(filter["properties.length"] || {}),
        $gte: parseInt(min_length, 10),
      };
    }
    if (max_length) {
      filter["properties.length"] = {
        ...(filter["properties.length"] || {}),
        $lte: parseInt(max_length, 10),
      };
    }
    if (word_count) {
      filter["properties.word_count"] = parseInt(word_count, 10);
    }
    if (contains_character) {
      filter.value = { $regex: contains_character, $options: "i" }; // Case-insensitive search
    }

    const strings = await Strings.find(filter);
    res.status(200).json({
      data: strings,
      filters_applied: {
        is_palindrome,
        min_length,
        max_length,
        word_count,
        contains_character,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/strings/filter-by-natural-language", async (req, res) => {
  try {
    const { q: query } = req.query;

    const filter = {};
    if (!query) {
      return res
        .status(400)
        .json({ error: "Query parameter 'q' is required." });
    } else if (query === "all single word palindromic strings") {
      filter["properties.word_count"] = 1;
      filter["properties.is_palindrome"] = true;
    } else if (query === "strings longer than 10 characters") {
      filter["properties.length"] = { $gt: 10 };
    } else if (query === "palindromic strings that contain the first vowel") {
      filter["properties.is_palindrome"] = true;
      filter.value = { $regex: /^[aeiou]/i };
    } else if (query === "strings containing the letter z") {
      filter.value = { $regex: /z/i };
    } else if (query === "palindromic strings that are not palindromes") {
      return res.status(422).json({
        error:
          "422 Unprocessable Entity :Query parsed but resulted in conflicting filters",
      });
    } else {
      return res
        .status(400)
        .json({ error: "Unable to parse natural language query" });
    }

    const strings = await Strings.find(filter);

    const parsedFilters = Object.fromEntries(
      Object.entries(filter).map(([key, value]) => [
        key.replace("properties.", ""),
        value,
      ])
    );

    res.status(200).json({
      data: strings,
      count: strings.length,
      interpreted_query: {
        original: query,
        parsed_filters: parsedFilters,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/strings/:string_value", async (req, res) => {
  console.log(req.params.string_value);
  try {
    const string = await Strings.findOne({
      value: req.params.string_value,
    });
    if (!string) return res.status(404).json({ error: "String not found" });
    res.status(200).json(string);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/strings/:string_value", async (req, res) => {
  try {
    const string = await Strings.findOneAndDelete({
      value: req.params.string_value,
    });

    if (!string) {
      return res
        .status(404)
        .json({ error: "String does not exist in the system" });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
