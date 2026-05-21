const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const models = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b'
];

const testModels = async () => {
  for (const modelName of models) {
    try {
      console.log(`\n🔄 Testing: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hello in one word');
      const text = result.response.text();
      console.log(`✅ WORKS: ${modelName} → "${text}"`);
    } catch (err) {
      console.log(`❌ FAILED: ${modelName} → ${err.message}`);
    }
  }
};

testModels();