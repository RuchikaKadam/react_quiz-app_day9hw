import './QuizApp.css'
import { useEffect, useState, useCallback } from 'react';

let lastFetchTime = 0;
const fetchInterval = 1000;

const QuizApp = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(5);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [theme, setTheme] = useState('light');
  const [showScoreCard, setShowScoreCard] = useState(false);

  const fetchQuestions = async () => {
    const currentTime = Date.now();
    if (currentTime - lastFetchTime < fetchInterval) {
      const delay = fetchInterval - (currentTime - lastFetchTime);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    lastFetchTime = Date.now();

    try {
      const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setQuestions(data.results);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setTimer(5);
      setSelectedAnswer('');
    } else {
      setQuizCompleted(true);
    }
  }, [currentQuestionIndex, questions]);

  useEffect(() => {
    if (quizCompleted) {
      return;
    }

    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 0) {
          clearInterval(countdown);
          handleNextQuestion();
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [currentQuestionIndex, quizCompleted, handleNextQuestion]);

  const handleAnswerSelection = (answer) => {
    setSelectedAnswer(answer);

    if (answer === questions[currentQuestionIndex].correct_answer) {
      setScore((prevScore) => prevScore + 1);
    }

    // Disable further answer selection
    setTimeout(() => {
      setSelectedAnswer('');
      handleNextQuestion();
    }, 1000);
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizCompleted(false);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`app ${theme === 'light' ? 'light-theme' : 'dark-theme'}`}>
      <h1>Quiz App</h1>
      <button style={{transform:'translate(50rem, -13rem)'}} onClick={toggleTheme}>Toggle Theme</button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className='quiz-cont'>
          <h2>Question {currentQuestionIndex + 1} / {questions?.length || 0}</h2> {/* Added check for questions array */}
          <h3>{questions[currentQuestionIndex]?.question}</h3>
          <ul>
            {questions[currentQuestionIndex]?.incorrect_answers.map((answer, index) => (
              <li key={index} onClick={() => handleAnswerSelection(answer)} className={selectedAnswer === answer ? 'selected' : ''}>
                {answer}
              </li>
            ))}
            <li onClick={() => handleAnswerSelection(questions[currentQuestionIndex]?.correct_answer)} className={selectedAnswer === questions[currentQuestionIndex]?.correct_answer ? 'selected' : ''}> 
              {questions[currentQuestionIndex]?.correct_answer}
            </li>
          </ul>
          <p>Time left: {timer} seconds</p>
          {/* <p>Score: {score}</p> */}
          {quizCompleted && !showScoreCard && (
  <div>
    <p>Time left: {timer} seconds</p>
    <button onClick={() => setShowScoreCard(true)}>Show Score</button>
  </div>
)}

{showScoreCard && (
  <div>
    <h2>Quiz Completed!</h2>
    <p>Your final score is: {score} / {questions?.length || 0}</p> 
    <button onClick={handleRestartQuiz}>Restart Quiz</button>
  </div>
)}
        </div>
      )}
    </div>
  );    
};

export default QuizApp;
