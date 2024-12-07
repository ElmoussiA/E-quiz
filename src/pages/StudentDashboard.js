import React, { useState } from 'react';
import { database } from '../firebase';
import { ref, set, get } from 'firebase/database';

const StudentDashboard = () => {
    const [quizCode, setQuizCode] = useState('');
    const [quizData, setQuizData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [error, setError] = useState('');

    const fetchQuiz = async () => {
        if (!quizCode.trim()) {
            setError('Please enter a valid quiz code.');
            return;
        }

        try {
            const quizRef = ref(database, `quizzes/${quizCode}`);
            const snapshot = await get(quizRef);

            if (snapshot.exists()) {
                setQuizData(snapshot.val());
                setError('');
            } else {
                setError('Quiz not found. Please check the quiz code.');
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
            setError('Failed to fetch quiz. Please try again.');
        }
    };

    const handleAnswerChange = (index, value) => {
        setAnswers((prev) => ({
            ...prev,
            [index]: value,
        }));
    };

    const calculateScore = () => {
        let score = 0;

        quizData.questions.forEach((question, index) => {
            if (question.type === 'radio' || question.type === 'text') {
                if (answers[index] === question.correctAnswer) {
                    score++;
                }
            } else if (question.type === 'checkbox') {
                const correctAnswers = question.correctAnswer || []; // Array of correct answers
                const selectedAnswers = answers[index] || []; // Array of selected answers

                if (
                    correctAnswers.length === selectedAnswers.length &&
                    correctAnswers.every((ans) => selectedAnswers.includes(ans))
                ) {
                    score++;
                }
            }
        });

        return score;
    };
    const { publishNotification } = require('./snsNotifications'); // Import the SNS logic

    const submitQuiz = async () => {
        const score = calculateScore();
    
        try {
            const studentId = `student_${Math.floor(Math.random() * 1000)}`; // Replace with actual student ID logic
            const studentRef = ref(database, `answers/${quizCode}/${studentId}`);
            await set(studentRef, {
                answers,
                score,
            });
    
            // Send notification
            const topicArn = 'arn:aws:sns:eu-north-1:761018863560:QuizNotifications:10578732-94e6-45ca-9b93-617058c49278'; // Replace with your Topic ARN
            const message = `Student ${studentId} submitted quiz ${quizCode}. Score: ${score}`;
            await publishNotification(message, topicArn);
    
            alert(`Quiz submitted successfully! You scored ${score}/${quizData.questions.length}`);
            setQuizData(null);
            setAnswers({});
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Failed to submit quiz. Please try again.');
        }
    };
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Student Dashboard</h1>
            <p>Enter a quiz code to take a quiz.</p>

            {!quizData ? (
                <div>
                    <input
                        type="text"
                        placeholder="Enter Quiz Code"
                        value={quizCode}
                        onChange={(e) => setQuizCode(e.target.value)}
                        style={{ padding: '10px', fontSize: '16px', width: '200px' }}
                    />
                    <button
                        onClick={fetchQuiz}
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
                        Fetch Quiz
                    </button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            ) : (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        submitQuiz();
                    }}
                >
                    {quizData.questions.map((question, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                            <h3>
                                {index + 1}. {question.text}
                            </h3>
                            {question.type === 'radio' &&
                                question.options.map((option, i) => (
                                    <label key={i} style={{ display: 'block', marginBottom: '5px' }}>
                                        <input
                                            type="radio"
                                            name={`question-${index}`}
                                            value={option}
                                            onChange={() => handleAnswerChange(index, option)}
                                        />
                                        {option}
                                    </label>
                                ))}
                            {question.type === 'checkbox' &&
                                question.options.map((option, i) => (
                                    <label key={i} style={{ display: 'block', marginBottom: '5px' }}>
                                        <input
                                            type="checkbox"
                                            value={option}
                                            onChange={(e) => {
                                                const selected = answers[index] || [];
                                                handleAnswerChange(
                                                    index,
                                                    e.target.checked
                                                        ? [...selected, option]
                                                        : selected.filter((ans) => ans !== option)
                                                );
                                            }}
                                        />
                                        {option}
                                    </label>
                                ))}
                            {question.type === 'text' && (
                                <input
                                    type="text"
                                    style={{ padding: '10px', fontSize: '16px', width: '300px' }}
                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                    <button
                        type="submit"
                        style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            backgroundColor: '#008CBA',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Submit Quiz
                    </button>
                </form>
            )}
        </div>
    );
};

export default StudentDashboard;
