import OpenAI from "openai";

const apiKey = process.env["OPENAI_API_KEY"];

if (!apiKey) {
  throw new Error("OPENAI_API_KEY environment variable is required but was not provided.");
}

const baseURL = process.env["OPENAI_BASE_URL"];

export const openai = new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
