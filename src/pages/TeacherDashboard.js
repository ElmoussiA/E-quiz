import React, { useState } from 'react';
import { database } from '../firebase';
import { ref, set } from 'firebase/database';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
    const [quizTitle, setQuizTitle] = useState('');
    const [quizDescription, setQuizDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [questionType, setQuestionType] = useState('radio');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctAnswers, setCorrectAnswers] = useState([]);

    const handleAddQuestion = () => {
        if (!currentQuestion.trim()) {
            alert('Please enter a question.');
            return;
        }

        const newQuestion = {
            text: currentQuestion,
            type: questionType,
            options: questionType === 'text' ? [] : options.filter((o) => o.trim() !== ''),
            correctAnswer: questionType === 'text' ? correctAnswers[0] : correctAnswers,
        };

        setQuestions([...questions, newQuestion]);
        setCurrentQuestion('');
        setOptions(['', '', '', '']);
        setCorrectAnswers([]);
    };

    const { publishNotification } = require('./snsNotifications'); // Import the SNS logic

const handleCreateQuiz = async () => {
    if (!quizTitle.trim() || !quizDescription.trim() || questions.length === 0) {
        alert('Please fill out all fields and add at least one question.');
        return;
    }

    const quizData = {
        title: quizTitle,
        description: quizDescription,
        questions,
        quizCode: `QUIZ${Math.floor(1000 + Math.random() * 9000)}`, // Random quiz code
    };

    try {
        const quizRef = ref(database, `quizzes/${quizData.quizCode}`);
        await set(quizRef, quizData);

        // Send notification
        const topicArn = 'arn:aws:sns:eu-north-1:761018863560:QuizNotifications:1edc06c8-f062-493e-87e2-8ba30928ea53'; // Replace with your Topic ARN
        const message = `A new quiz has been published! Title: ${quizTitle}`;
        await publishNotification(message, topicArn);

        alert(`Quiz created successfully! Quiz Code: ${quizData.quizCode}`);
        setQuizTitle('');
        setQuizDescription('');
        setQuestions([]);
    } catch (error) {
        console.error('Error saving quiz:', error);
        alert('Failed to save the quiz. Please try again.');
    }
};

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...options];
        updatedOptions[index] = value;
        setOptions(updatedOptions);
    };

    const handleCorrectAnswerChange = (index, value) => {
        setCorrectAnswers((prev) =>
            questionType === 'checkbox'
                ? prev.includes(value)
                    ? prev.filter((ans) => ans !== value)
                    : [...prev, value]
                : [value]
        );
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Teacher Dashboard</h1>
            <input
                type="text"
                placeholder="Quiz Title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                style={{ padding: '10px', fontSize: '16px', width: '300px' }}
            />
            <textarea
                placeholder="Quiz Description"
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                style={{
                    padding: '10px',
                    fontSize: '16px',
                    width: '300px',
                    height: '80px',
                    marginTop: '10px',
                }}
            />
            <h3>Questions</h3>
            <input
                type="text"
                placeholder="Enter a question"
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                style={{ padding: '10px', fontSize: '16px', width: '300px' }}
            />
            <label>
                <input
                    type="radio"
                    name="questionType"
                    value="radio"
                    checked={questionType === 'radio'}
                    onChange={() => setQuestionType('radio')}
                />
                Single Answer
            </label>
            <label>
                <input
                    type="radio"
                    name="questionType"
                    value="checkbox"
                    checked={questionType === 'checkbox'}
                    onChange={() => setQuestionType('checkbox')}
                />
                Multiple Answers
            </label>
            <label>
                <input
                    type="radio"
                    name="questionType"
                    value="text"
                    checked={questionType === 'text'}
                    onChange={() => setQuestionType('text')}
                />
                Text Answer
            </label>
            {questionType !== 'text' && (
                <div>
                    <h4>Options</h4>
                    {options.map((option, index) => (
                        <div key={index}>
                            <input
                                type="text"
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                style={{ padding: '10px', fontSize: '16px', width: '250px' }}
                            />
                            <input
                                type={questionType}
                                name="correctAnswer"
                                value={option}
                                onChange={() => handleCorrectAnswerChange(index, option)}
                            />
                        </div>
                    ))}
                </div>
            )}
            {questionType === 'text' && (
                <input
                    type="text"
                    placeholder="Correct Answer"
                    value={correctAnswers[0] || ''}
                    onChange={(e) => handleCorrectAnswerChange(0, e.target.value)}
                    style={{ padding: '10px', fontSize: '16px', width: '300px' }}
                />
            )}
            <button onClick={handleAddQuestion}>Add Question</button>
            <ul>
                {questions.map((q, index) => (
                    <li key={index}>
                        {index + 1}. {q.text} ({q.type}) - Correct: {JSON.stringify(q.correctAnswer)}
                    </li>
                ))}
            </ul>
            <button onClick={handleCreateQuiz}>Create Quiz</button>
            <Link to="/teacher-scores">
                <button
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#008CBA',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginTop: '20px',
                    }}
                >
                    View Scores
                </button>
            </Link>
        </div>
    );
};

export default TeacherDashboard;
