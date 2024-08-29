let quizData = []; // Store the quiz questions here
let filteredQuiz = [];
let currentMode = '';
let selectedModules = [];
let currentQuestionIndex = 0;
let score = 0;
const maxQuestions = 20;

const sections = [
    "1.1", "1.2",
    "2.1", "2.2", "2.3",
    "3.1", "3.2", "3.3", "3.4", "3.5",
    "4.1", "4.2", "4.3",
    "5.1", "5.2", "5.3",
    "6.1", "6.2", "6.3", "6.4",
    "7.1", "7.2", "7.3", "7.4",
    "8.1", "8.2", "8.3", "8.4", "8.5"
];

// Function to load quiz data from the JSON file
async function loadQuizData() {
    try {
        const response = await fetch('quizData.json');
        quizData = await response.json(); // Load data into quizData
    } catch (error) {
        console.error("Failed to load quiz data:", error);
    }
}

// Function to initialize the module buttons and attach event listeners
function initializeModuleButtons() {
    const moduleButtons = document.querySelectorAll('.module-button[data-module]');
    moduleButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleModule(this);
        });
    });
}

// Function to show the mode selection screen
function selectMode(mode) {
    currentMode = mode;
    document.getElementById('title-page').style.display = 'none';
    document.getElementById('module-selection-page').style.display = 'block';
    initializeModuleButtons(); // Ensure event listeners are attached each time
}

// Function to toggle individual module selection
function toggleModule(button) {
    const module = button.dataset.module;
    if (selectedModules.includes(module)) {
        selectedModules = selectedModules.filter(m => m !== module);
        button.classList.remove('selected');
    } else {
        selectedModules.push(module);
        button.classList.add('selected');
    }
    console.log("Selected modules:", selectedModules);
}

// Function to update the appearance of module buttons based on selection
function updateModuleButtons() {
    const moduleButtons = document.querySelectorAll('.module-button[data-module]');
    moduleButtons.forEach(button => {
        if (selectedModules.includes(button.dataset.module)) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
}

// Function to select all Year 11 sections
function selectYear11() {
    const year11Modules = sections.filter(section => 
        section.startsWith("1") || 
        section.startsWith("2") || 
        section.startsWith("3") || 
        section.startsWith("4")
    );
    if (year11Modules.every(module => selectedModules.includes(module))) {
        selectedModules = selectedModules.filter(m => !year11Modules.includes(m));
    } else {
        year11Modules.forEach(module => {
            if (!selectedModules.includes(module)) {
                selectedModules.push(module);
            }
        });
    }
    updateModuleButtons(); // Update visual states
    console.log("Selected Year 11 modules:", selectedModules);
}

// Function to select all Year 12 sections
function selectYear12() {
    const year12Modules = sections.filter(section => 
        section.startsWith("5") || 
        section.startsWith("6") || 
        section.startsWith("7") || 
        section.startsWith("8")
    );
    if (year12Modules.every(module => selectedModules.includes(module))) {
        selectedModules = selectedModules.filter(m => !year12Modules.includes(m));
    } else {
        year12Modules.forEach(module => {
            if (!selectedModules.includes(module)) {
                selectedModules.push(module);
            }
        });
    }
    updateModuleButtons(); // Update visual states
    console.log("Selected Year 12 modules:", selectedModules);
}

// Function to select all Year 11 & 12 sections
function selectAllModules() {
    if (sections.every(module => selectedModules.includes(module))) {
        selectedModules = [];
    } else {
        selectedModules = [...sections];
    }
    updateModuleButtons(); // Update visual states
    console.log("Selected all modules:", selectedModules);
}

// Function to filter questions based on selected modules
function filterQuestions() {
    filteredQuiz = quizData.filter(question => selectedModules.includes(question.module));
}

// Function to start the quiz after module selection
async function startQuiz() {
    filterQuestions(); // Filter questions based on the selected module(s)
    
    if (filteredQuiz.length === 0) {
        alert('Please select at least one section.');
        return;
    }
    
    document.getElementById('module-selection-page').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    currentQuestionIndex = 0;
    score = 0;
    updateQuizInfo(); // Update the quiz information (e.g., score, question count)
    loadQuestion(); // Load the first question
}

// Function to update quiz info (e.g., current question number in scored mode)
function updateQuizInfo() {
    if (currentMode === 'scored') {
        document.getElementById('quiz-info').innerText = `Question ${currentQuestionIndex + 1} of ${maxQuestions}`;
    } else {
        document.getElementById('quiz-info').innerText = '';
    }
}

// Function to load a new question
function loadQuestion() {
    if (currentMode === 'scored' && currentQuestionIndex >= maxQuestions) {
        showResults();
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuiz.length);
    const questionData = filteredQuiz[randomIndex];

    document.getElementById('question').innerText = questionData.question;

    const answerButtons = document.querySelectorAll('.answer-button');
    const options = ['a', 'b', 'c', 'd'];

    answerButtons.forEach((btn, index) => {
        btn.innerText = questionData.options[options[index]];
        btn.disabled = false;
        btn.onclick = function() {
            checkAnswer(index, questionData);
        };
    });

    document.getElementById('feedback').innerText = "";
    document.getElementById('next-button').style.display = 'none';
}

// Function to check the selected answer
function checkAnswer(selectedIndex, questionData) {
    const selectedLetter = String.fromCharCode(97 + selectedIndex); // Get 'a', 'b', 'c', 'd'
    if (selectedLetter === questionData.correctAnswer) {
        document.getElementById('feedback').innerText = "Correct! " + questionData.explanation;
        if (currentMode === 'scored') {
            score++;
        }
    } else {
        document.getElementById('feedback').innerText = "Incorrect! The correct answer is " + questionData.correctAnswer + ". " + questionData.explanation;
    }

    // Disable buttons after selection
    document.querySelectorAll('.answer-button').forEach(btn => btn.disabled = true);

    // Show the "Next Question" button
    document.getElementById('next-button').style.display = 'block';
}

// Function to load the next question
function nextQuestion() {
    currentQuestionIndex++;
    updateQuizInfo();
    loadQuestion();
}

// Function to show the results at the end of scored mode
function showResults() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-page').style.display = 'block';
    document.getElementById('results').innerText = `You scored ${score} out of ${maxQuestions}.`;
}

// Function to restart the quiz
function restartQuiz() {
    document.getElementById('results-page').style.display = 'none';
    document.getElementById('title-page').style.display = 'block';
}

// Function to go back to the home page
function goHome() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-page').style.display = 'none';
    document.getElementById('title-page').style.display = 'block';
}

// Load quiz data on page load
window.onload = function() {
    loadQuizData();
    initializeModuleButtons(); // Initialize module buttons after loading the page
};
