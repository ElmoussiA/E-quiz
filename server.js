const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
app.use(bodyParser.json());

// Connect to AWS RDS
const db = mysql.createConnection({
    host: 'db-quiz1.cluster-chaeyguwuap5.eu-north-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Azerty1234567890',
    database: 'db-quiz1',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to RDS:', err);
        return;
    }
    console.log('Connected to AWS RDS');
});

// Save quiz to RDS
app.post('/save-quiz', (req, res) => {
    const { quizCode, title, description, questions } = req.body;

    // Insert quiz metadata
    db.query(
        'INSERT INTO quizzes (quizCode, title, description) VALUES (?, ?, ?)',
        [quizCode, title, description],
        (err) => {
            if (err) {
                console.error('Error saving quiz metadata:', err);
                return res.status(500).send('Error saving quiz metadata');
            }

            // Insert questions
            const questionQueries = questions.map((q) =>
                db.query(
                    'INSERT INTO questions (quizCode, text, type) VALUES (?, ?, ?)',
                    [quizCode, q.text, q.type],
                    (err) => {
                        if (err) {
                            console.error('Error saving questions:', err);
                            return res.status(500).send('Error saving questions');
                        }
                    }
                )
            );

            Promise.all(questionQueries)
                .then(() => res.status(200).send('Quiz saved successfully'))
                .catch((error) => {
                    console.error('Error saving quiz:', error);
                    res.status(500).send('Error saving quiz');
                });
        }
    );
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
