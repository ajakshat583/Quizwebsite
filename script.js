// DOM Elements
const startButton = document.getElementById('start-btn');
const nextButton = document.getElementById('next-btn');
const questionContainerElement = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const scoreContainer = document.getElementById('score-container');
const scoreElement = document.getElementById('score');
const progressBar = document.getElementById('progress');
const questionNumber = document.getElementById('question-number');
const scoreMessage = document.getElementById('score-message');

// Game state
let currentQuestionIndex = 0;
let score = 0;
let questions = [];

// Event Listeners
startButton.addEventListener('click', startQuiz);
nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    setNextQuestion();
});

async function startQuiz() {
    startButton.classList.add('hide');
    scoreContainer.classList.remove('hide');
    currentQuestionIndex = 0;
    score = 0;
    scoreElement.innerText = score;
    questionContainerElement.classList.remove('hide');
    
    try {
        questions = await fetchQuestions();
        setNextQuestion();
    } catch (error) {
        console.error('Error starting quiz:', error);
        questionElement.innerText = 'Error loading questions. Please try again.';
    }
}

async function fetchQuestions() {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=100&type=multiple');
        const data = await response.json();
        return data.results.map(q => ({
            question: decodeHTML(q.question),
            answers: [
                { text: decodeHTML(q.correct_answer), correct: true },
                ...q.incorrect_answers.map(answer => ({
                    text: decodeHTML(answer),
                    correct: false
                }))
            ].sort(() => Math.random() - 0.5)
        }));
    } catch (error) {
        console.error('Error fetching questions:', error);
        return [];
    }
}

function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function setNextQuestion() {
    resetState();
    showQuestion(questions[currentQuestionIndex]);
    updateProgress();
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    questionNumber.textContent = `Question ${currentQuestionIndex + 1}/${questions.length}`;
}

function showQuestion(question) {
    questionElement.innerText = question.question;
    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('btn');
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
}

function resetState() {
    clearStatusClass(document.body);
    nextButton.classList.add('hide');
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function selectAnswer(e) {
    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct;
    
    if (correct) {
        score++;
        scoreElement.innerText = score;
    }

    setStatusClass(document.body, correct);
    Array.from(answerButtonsElement.children).forEach(button => {
        setStatusClass(button, button.dataset.correct);
    });

    if (currentQuestionIndex < questions.length - 1) {
        nextButton.classList.remove('hide');
    } else {
        showFinalScore();
    }
}

function showFinalScore() {
    questionContainerElement.classList.add('hide');
    nextButton.classList.add('hide');
    scoreContainer.classList.remove('hide');
    
    const percentage = (score / questions.length) * 100;
    let message = '';
    
    if (percentage >= 90) {
        message = 'Outstanding! You\'re a quiz master! 🏆';
    } else if (percentage >= 70) {
        message = 'Great job! You really know your stuff! 🌟';
    } else if (percentage >= 50) {
        message = 'Good effort! Keep learning! 📚';
    } else {
        message = 'Keep practicing! You\'ll get better! 💪';
    }
    
    scoreMessage.textContent = message;
    startButton.innerText = 'Play Again';
    startButton.classList.remove('hide');
}

function setStatusClass(element, correct) {
    clearStatusClass(element);
    if (correct) {
        element.classList.add('correct');
    } else {
        element.classList.add('wrong');
    }
}

function clearStatusClass(element) {
    element.classList.remove('correct');
    element.classList.remove('wrong');
} 