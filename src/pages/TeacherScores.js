import React, { useState } from 'react';
import { database } from '../firebase';
import { ref, get } from 'firebase/database';

const TeacherScores = () => {
    const [quizCode, setQuizCode] = useState('');
    const [scores, setScores] = useState([]);
    const [error, setError] = useState('');

    const fetchScores = async () => {
        if (!quizCode.trim()) {
            setError('Please enter a valid quiz code.');
            return;
        }
    
        try {
            const scoreRef = ref(database, `answers/${quizCode}`); // Correct path
            console.log('Fetching scores from:', `answers/${quizCode}`); // Debug log
            const snapshot = await get(scoreRef);
    
            if (snapshot.exists()) {
                console.log('Scores fetched:', snapshot.val()); // Debug log
                setScores(Object.values(snapshot.val()));
                setError('');
            } else {
                console.error('No scores found for this quiz.'); // Debug log
                setError('No scores found for this quiz.');
                setScores([]);
            }
        } catch (error) {
            console.error('Error fetching scores:', error); // Debug log
            setError('Failed to fetch scores. Please try again.');
            setScores([]);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Teacher Scores</h1>
            <p>Enter the quiz code to view student scores.</p>

            <input
                type="text"
                placeholder="Enter Quiz Code"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value)}
                style={{ padding: '10px', fontSize: '16px', width: '200px' }}
            />
            <button
                onClick={fetchScores}
                style={{
                    marginLeft: '10px',
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Fetch Scores
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {scores.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Scores for Quiz: {quizCode}</h2>
                    <ul style={{ listStyleType: 'none', padding: '0' }}>
                        {scores.map((score, index) => (
                            <li
                                key={index}
                                style={{
                                    textAlign: 'left',
                                    margin: '10px 0',
                                    padding: '10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '5px',
                                }}
                            >
                                <strong>Student:</strong> {score.student} <br />
                                <strong>Score:</strong> {score.score}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TeacherScores;
