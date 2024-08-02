import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;
const WIT_AI_TOKEN = 'NC2RI6F4U542DIAX5D6SXCI3IQH6HZQF';

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/analyze-goal', async (req, res) => {
    const { goal } = req.body;

    if (!goal) {
        return res.status(400).json({ message: 'Goal is required' });
    }

    try {
        const response = await fetch(`https://api.wit.ai/message?v=20210711&q=${encodeURIComponent(goal)}`, {
            headers: {
                'Authorization': `Bearer ${WIT_AI_TOKEN}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Wit.ai API error:', errorText);
            return res.status(500).json({ message: 'Wit.ai API error', details: errorText });
        }

        const data = await response.json();
        const entities = data.entities;

        const timeEntity = entities['wit$datetime:datetime'] || [];
        const deadline = timeEntity.length > 0 ? timeEntity[0].value : null;

        if (deadline) {
            return res.json({ deadline });
        } else {
            return res.json({ options: ['3 months', '6 months', 'end of this year', 'custom'] });
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});