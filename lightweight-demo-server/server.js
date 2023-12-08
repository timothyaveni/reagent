const OpenAI = require('openai');
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());
app.use(cors()); // Add this line to allow all CORS requests

let lastSave = null;

app.post('/save', (req, res) => {
  console.log(req.body);
  lastSave = req.body;
});

app.get('/complete', async (req, res) => {
  const { apiKey, ...params } = req.query;

  if (apiKey !== '1234') {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  const prompt = []; // todo: system
  for (let i = 0; i < lastSave.editorValue.length; i++) {
    if (lastSave.editorValue[i].type === 'chat-turn') {
      const { speaker } = lastSave.editorValue[i];
      i++;
      const paragraph = lastSave.editorValue[i];
      let messageText = '';
      for (const part of paragraph.children) {
        console.log(part);
        if (part.text) { // ok could be a top level empty text node but ok to skip anyway
          messageText += part.text;
        } else if (part.type === 'parameter') {
          const { parameterId } = part;
          const nameForId = lastSave.parameterOptions[parameterId].parameterName;
          messageText += params[nameForId] || ''; // lots of options for error reporting here; duplicates in the request, missing parameters
        }
      }
      const turn = { "role": speaker , content: messageText };
      prompt.push(turn);
    }
  }

  // console.log(prompt);

  const openai = new OpenAI(process.env.OPENAI_API_KEY);

  const stream = await openai.chat.completions.create({
    messages: prompt,
    model: "gpt-3.5-turbo",
    stream: true,
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Keep-Alive', 'timeout=20, max=1000');

  for await (const chunk of stream) {
    res.write(chunk.choices[0]?.delta?.content || '');
  }

  res.end();
});

app.listen(2348, () => {
  console.log('Server is running on port 2348');
});
