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
        console.log('Wit.ai API response:', data);

        const entities = data.entities;

        // Extract datetime entity
        const datetimeEntity = entities['wit$datetime:datetime'] ? entities['wit$datetime:datetime'][0] : null;
        const datetimeValue = datetimeEntity ? datetimeEntity.value : null;

        // Extract quantity entity
        const quantityEntity = entities['wit$quantity:quantity'] ? entities['wit$quantity:quantity'][0] : null;
        const quantityValue = quantityEntity ? quantityEntity.value : null;

        console.log('Datetime Entity:', datetimeEntity);
        console.log('Datetime Value:', datetimeValue);
        console.log('Quantity Entity:', quantityEntity);
        console.log('Quantity Value:', quantityValue);

        // Determine response based on datetime value
        if (datetimeValue) {
            return res.json({ deadline: datetimeValue });
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