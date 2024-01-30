// Initialize game variables
let players = [];
let currentSubject = '';
let currentQuestionIndex = 0;
let currentPlayerIndex = 0;
let currentQuestions = [];
let selectedSubject = '';
let HTMLQuestions = [];
let CSSQuestions = [];
let JSQuestions = [];
const CORRECT_BONUS = 10; 

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Fetch and shuffle HTML Questions
fetch('http://127.0.0.1:8081/html.json')
    .then(response => response.json())
    .then(data => {
        console.log("HTML Questions Loaded:", data); // Log the fetched data
        HTMLQuestions = data.questions;
        shuffleArray(HTMLQuestions);
    })
    .catch(error => console.error('Error loading HTML questions:', error));

// Fetch and shuffle CSS Questions
fetch('http://127.0.0.1:8081/css.json')
    .then(response => response.json())
    .then(data => {
        console.log("CSS Questions Loaded:", data); // Log the fetched data
        CSSQuestions = data.questions;
        shuffleArray(CSSQuestions);
    })
    .catch(error => console.error('Error loading CSS questions:', error));

// Fetch and shuffle JavaScript Questions
fetch('http://127.0.0.1:8081/js.json')
    .then(response => response.json())
    .then(data => {
        console.log("Java Questions Loaded:", data); // Log the fetched data
        JSQuestions = data.questions;
        shuffleArray(JSQuestions);
    })
    .catch(error => console.error('Error loading JavaScript questions:', error));


  document.addEventListener("DOMContentLoaded", function() {
    
    const subjectButtons = document.querySelectorAll('.subjectButton');
    subjectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const subject = this.getAttribute('data-subject');
            startGame(subject); 
        });
    });
});

function startGame(selectedSubject) {
    currentSubject = selectedSubject;
    currentQuestionIndex = 0;
    currentPlayerIndex = 0;

    // question set based on the selected subject
    switch (selectedSubject) {
        case 'HTML':
            currentQuestions = HTMLQuestions.slice(0, 10);
            break;
        case 'CSS':
            currentQuestions = CSSQuestions.slice(0, 10);
            break;
        case 'JavaScript':
            currentQuestions = JSQuestions.slice(0, 10);
            break;
    }

    // Hide subject selection and show quiz screen
    document.getElementById('subjectSelectionScreen').style.display = 'none';
    document.getElementById('quizScreen').style.display = 'block';

    displayNextQuestion();
}

function displayNextQuestion() {
    if (currentQuestionIndex < currentQuestions.length) {
        const question = currentQuestions[currentQuestionIndex];
        const questionContainer = document.getElementById('question');
        questionContainer.textContent = question.questionText;
        const answersContainer = document.getElementById('answers');
        answersContainer.innerHTML = ''; // Clear previous answers

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('answerButton');
            button.onclick = () => selectAnswer(index);
            answersContainer.appendChild(button);
        });

        highlightCurrentPlayer();
        resetTimer(10); // Reset and start a new 10-second timer
    } else {
        endGame();
    }
}
function resetTimer(duration) {
    clearInterval(timer);
    startTimer(duration);
}


function highlightCurrentPlayer() {
    const currentPlayerHeader = document.getElementById('currentPlayerHeader');

    players.forEach((player, index) => {
        const playerDiv = document.getElementById('player-info-' + index);
        if (index === currentPlayerIndex) {
            playerDiv.style.fontWeight = 'bold';
            currentPlayerHeader.innerHTML = `It's <span style="color: ${getPlayerColor(index)};">${player.name}</span>'s turn`;
            currentPlayerHeader.style.color = 'white'; // Set the color of the text to white
        } else {
            playerDiv.style.fontWeight = 'normal';
        }
    });
}


function allPlayersSelected() {
    return players.every(player => player.hasSelected);
}
    
    
function selectAnswer(selectedIndex) {
    const correctAnswer = currentQuestions[currentQuestionIndex].correctAnswer;
    const chosenAnswer = currentQuestions[currentQuestionIndex].options[selectedIndex];
    const answerButton = document.querySelectorAll('.answerButton')[selectedIndex];

    if (chosenAnswer === correctAnswer) {
        players[currentPlayerIndex].score += CORRECT_BONUS;
        answerButton.style.backgroundColor = 'green';
        answerButton.textContent += ' - Correct';
    } else {
        answerButton.style.backgroundColor = 'red';
        answerButton.textContent += ' - Incorrect';
    }

    // Disable all answer buttons after selection
    document.querySelectorAll('.answerButton').forEach(btn => btn.disabled = true);

    // Update the scores on the screen
    displayPlayers();

    // Proceed to next turn or question after a short delay
    setTimeout(() => {
        proceedToNext();
    }, 1000); // 1-second delay
}

function proceedToNext() {
    currentPlayerIndex++;
    if (currentPlayerIndex >= players.length) {
        currentPlayerIndex = 0;
        currentQuestionIndex++;
    }

    if (currentQuestionIndex < currentQuestions.length) {
        displayNextQuestion();
    } else {
        endGame();
    }
}

// Add this new function to handle the 'Continue' button click
document.getElementById('nextQuestion').addEventListener('click', function() {
    // Move to the next question if all players have selected their answers
    if (players.every(player => player.hasSelected)) {
        currentQuestionIndex++;
        currentPlayerIndex = 0; // Reset for the next question
        displayNextQuestion();
        this.disabled = true; // Disable the button until next answers are selected
        resetPlayerSelections();
    }
});

function resetPlayerSelections() {
    players.forEach(player => player.hasSelected = false);
}

function endGame() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = '<h2 style="color: white;">Game Over</h2>';

    // Sort players by score in descending order
    players.sort((a, b) => b.score - a.score);

    // Find the highest score
    const highestScore = players[0].score;

    // Find all players with the highest score
    const winners = players.filter(player => player.score === highestScore);

    // Create the end game message for winner(s)
    let winnerMessage = winners.length > 1 
        ? `Winners: ${winners.map(p => p.name).join(' and ')}`
        : `Winner: ${winners[0].name}`;

    // Display winner(s) in white
    const winnerDiv = document.createElement('div');
    winnerDiv.innerHTML = `<p style="color: white;">${winnerMessage}</p>`;
    gameArea.appendChild(winnerDiv);

    // Display the final scores
    players.forEach(player => {
        gameArea.innerHTML += `<p style="color: white;">${player.name}: ${player.score} points</p>`;
    });

    // Add a 'Play Again' button
    const playAgainButton = document.createElement('button');
    playAgainButton.textContent = 'Play Again';
    playAgainButton.addEventListener('click', () => location.reload());
    gameArea.appendChild(playAgainButton);

    // Add a 'Review Answers' button
    const reviewButton = document.createElement('button');
    reviewButton.textContent = 'Review Answers';
    reviewButton.addEventListener('click', () => reviewAnswers());
    gameArea.appendChild(reviewButton);
}

function reviewAnswers() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = '<h2>Review Answers</h2>';

    currentQuestions.forEach((question, questionIndex) => {
        const questionDiv = document.createElement('div');
        questionDiv.innerHTML = `<h3>Question ${questionIndex + 1}: ${question.questionText}</h3>`;

        
        players.forEach(player => {
            const playerAnswer = player.answers[questionIndex]; 
            const isCorrect = question.options[playerAnswer] === question.correctAnswer;
            const answerDiv = document.createElement('div');
            answerDiv.innerHTML = `<p>${player.name} chose: ${question.options[playerAnswer]} - ${isCorrect ? 'Correct' : 'Incorrect'}</p>`;
            questionDiv.appendChild(answerAnswerDiv);
        });

        // Display the correct answer
        const correctAnswerDiv = document.createElement('div');
        correctAnswerDiv.innerHTML = `<p>Correct Answer: ${question.correctAnswer}</p>`;
        questionDiv.appendChild(correctAnswerDiv);

        gameArea.appendChild(questionDiv);
    });
}


    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('toSubjectSelection').addEventListener('click', function() {
            // Logic to handle the next button click
            
            document.getElementById('playerSelectionScreen').style.display = 'none';
            document.getElementById('subjectSelectionScreen').style.display = 'block';
        });
    });
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('backToPlayerSelection').addEventListener('click', function() {
           
            document.getElementById('subjectSelectionScreen').style.display = 'none';
            document.getElementById('playerSelectionScreen').style.display = 'block';
        });
    });
    document.addEventListener("DOMContentLoaded", function() {
        // Add event listeners to each subject button
        const subjectButtons = document.querySelectorAll('.subjectButton');
        subjectButtons.forEach(button => {
            button.addEventListener('click', function() {
                const subject = this.getAttribute('data-subject');
                loadQuestions(subject);
            });
        });
    });
    
    function loadQuestions(subject) {
        // Fetch questions for the selected subject
        fetch(subject + '.json') 
            .then(response => response.json())
            .then(data => {
                startQuiz(data);
            })
            .catch(error => {
                console.error('Error fetching questions:', error);
            });
    }
    
    function startQuiz(questions) {
        currentQuestions = questions.slice(0, 10); // Select the first 10 questions
    
        currentQuestionIndex = 0;
        currentPlayerIndex = 0;
    
        document.getElementById('subjectSelectionScreen').style.display = 'none';
        document.getElementById('quizScreen').style.display = 'block';
    
        displayNextQuestion();
    }
    
    // Function to handle answer selection
function handleAnswerSelection(selectedAnswer) {
    const answersButtons = document.querySelectorAll('#answers button');
    answersButtons.forEach(button => {
        const answer = button.textContent;
       
        if (answer === selectedAnswer && selectedAnswer.isCorrect) {
            button.style.backgroundColor = 'green';
        } else if (answer === selectedAnswer && !selectedAnswer.isCorrect) {
            button.style.backgroundColor = 'red';
        } else {
            button.disabled = true; 
        }
    });

    console.log("Selected answer:", selectedAnswer);
   
}
document.addEventListener('DOMContentLoaded', function() {
    const subjectButtons = document.querySelectorAll('.subjectButton');
    subjectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const subject = this.getAttribute('data-subject');
            loadQuestions(subject);
        });
    });
});


function loadQuestions(subject) {
    let url = '';
    switch (subject) {
        case 'HTML':
            url = 'http://127.0.0.1:8081/html.json';
            break;
        case 'CSS':
            url = 'http://127.0.0.1:8081/css.json';
            break;
        case 'JavaScript':
            url = 'http://127.0.0.1:8081/js.json';
            break;
        default:
            console.error('Invalid subject');
            return;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.questions) {
                shuffleArray(data.questions);
                currentQuestions = data.questions.slice(0, 10); 
                startGame(subject);
            } else {
                console.error('Invalid question format');
            }
        })
        .catch(error => console.error('Error loading ' + subject + ' questions:', error));
}
function displayPlayers() {
    const playerInfoDiv = document.getElementById('playerInfo');
    playerInfoDiv.innerHTML = ''; // Clear existing content

    players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.textContent = `${player.name}: ${player.score} points`;
        playerDiv.style.color = getPlayerColor(index);
        playerDiv.id = 'player-info-' + index;
        playerInfoDiv.appendChild(playerDiv);
    });
}


function getPlayerColor(index) {
    const colors = ['red', 'blue', 'green', 'purple']; // Define player colors
    return colors[index % colors.length];
}

   
players = [
    { name: "Player 1", score: 0 },
    { name: "Player 2", score: 0 },
    { name: "Player 3", score: 0 },
    { name: "Player 4", score: 0 },
];

displayPlayers(); // Call this after setting up the players
let timer; // Global timer variable

function startTimer(duration) {
    const timerDiv = document.getElementById('timer');
    timerDiv.style.color = 'white'; // Set the color of the timer text to white
    clearInterval(timer); // Clear any existing timer
    let timeLeft = duration;

    timer = setInterval(() => {
        document.getElementById('timer').textContent = `Time left: ${timeLeft} seconds`;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timer);
            // Handle timeout: move to the next player
            currentPlayerIndex++;
            if (currentPlayerIndex >= players.length) {
                currentPlayerIndex = 0;
                currentQuestionIndex++;
                if (currentQuestionIndex < currentQuestions.length) {
                    displayNextQuestion();
                } else {
                    endGame(); // End the game if all questions have been answered
                }
            } else {
                displayCurrentPlayerTurn(); // Function to display the current player's turn
            }
        }
    }, 1000);
}
function displayCurrentPlayerTurn() {
    // Example implementation
    const currentPlayerDisplay = document.getElementById('currentPlayerDisplay');
    currentPlayerDisplay.textContent = `Current turn: ${players[currentPlayerIndex].name}`;
}

function rotateStartingPlayer() {
    // Rotate the starting player for the next question
    const firstPlayer = players.shift();
    players.push(firstPlayer);
}
document.getElementById('numberOfPlayers').addEventListener('change', function() {
    const playerCount = parseInt(this.value);
    const playerNameInputs = document.getElementById('playerNameInputs');
    playerNameInputs.innerHTML = ''; // Clear existing inputs

    for (let i = 0; i < playerCount; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Player ${i + 1} Name`;
        input.id = `player${i + 1}Name`;
        playerNameInputs.appendChild(input);
    }
});
document.getElementById('toSubjectSelection').addEventListener('click', function() {
    const playerCount = parseInt(document.getElementById('numberOfPlayers').value);
    players = [];

    for (let i = 0; i < playerCount; i++) {
        const playerName = document.getElementById(`player${i + 1}Name`).value || `Player ${i + 1}`;
        players.push({ name: playerName, score: 0, hasSelected: false });
    }

    document.getElementById('playerSelectionScreen').style.display = 'none';
    document.getElementById('subjectSelectionScreen').style.display = 'block';
    displayPlayers(); // Call to display player names
});
function displayPlayers() {
    const playerInfoDiv = document.getElementById('playerInfo');
    playerInfoDiv.innerHTML = ''; // Clear existing content

    players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.textContent = `${player.name}`;
        playerDiv.style.color = getPlayerColor(index);
        playerDiv.id = 'player-info-' + index;
        playerInfoDiv.appendChild(playerDiv);
    });
}
   // Event listener for 'Continue' button
   document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('nextQuestion').addEventListener('click', function() {
        if (allPlayersSelected()) {
            currentQuestionIndex++;
            currentPlayerIndex = 0; // Reset for the next question
            if (currentQuestionIndex < currentQuestions.length) {
                displayNextQuestion();
            } else {
                endGame();
            }
            this.disabled = true; // Disable the button until next answers are selected
            resetPlayerSelections();
        }
    });
});

function allPlayersSelected() {
    return players.every(player => player.hasSelected);
}

function resetPlayerSelections() {
    players.forEach(player => player.hasSelected = false);
}

