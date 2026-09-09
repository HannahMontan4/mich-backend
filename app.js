const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors()); // Permette le chiamate da Netlify
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/generate-chapter', async (req, res) => {
  try {
    const { prompt, maxWords, context } = req.body;
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Sei uno scrittore esperto. Scrivi in lingua italiana basandoti su questo contesto: Stile=${context?.tone || 'narrativo'}, POV=${context?.pov || 'prima persona'}.`
        },
        {
          role: 'user',
          content: `Scrivi un capitolo di circa ${maxWords || 1000} parole basato su questa trama: ${prompt}`
        }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    const generatedText = completion.choices[0]?.message?.content || "Nessun testo generato.";
    res.json({ text: generatedText });
  } catch (error) {
    console.error("Errore Groq:", error);
    res.status(500).json({ error: "Errore durante la generazione con Groq." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server attivo sulla porta ${PORT}`);
});
