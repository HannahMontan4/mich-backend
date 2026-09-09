const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/generate-chapter', async (req, res) => {
  try {
    const { prompt, maxWords, context } = req.body;

    const systemMessage = `Sei un assistente per la scrittura creativa. 
Titolo libro: ${context?.title || 'Senza titolo'}
POV: ${context?.pov || 'Terza persona'}
Tono: ${context?.tone || 'Neutro'}
Trama generale: ${context?.generalPlot || 'N/A'}`;

    const userMessage = `Scrivi un capitolo di circa ${maxWords || 500} parole basandoti su questa bozza/prompt:
${prompt}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_completion_tokens: 2048,
    });

    const text = completion.choices[0]?.message?.content || '';
    res.json({ text });
  } catch (error) {
    console.error('Errore durante la generazione:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server mich in ascolto sulla porta ${PORT}`);
});
