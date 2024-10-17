/***********************************************\
-					IMPORTS						-
\***********************************************/
import { DEBUG }
from '../../main.js';

import { BallConf, GameState, GraphConf, PaddleConf, GameConf, player1, player2, 
Results }
from './gameVariables.js';

import { prepareTwoPlayers, displayPlayer2Form }
from './twoPlayers.js'

import { prepareTournament, displayTournamentForm, startTournamentGame,
initializeTournamentMode, tournamentNextMatch, setupFinalMatch }
from './tournament.js'

import { createContainer, createVideo, createOverlay, createMenuButton,
createTournamentButton, createHowToPlayButton, createHowToPlayCard, createCardGif,
createWinningMessage, createRematchButton, createCanvas, createPausedGifContainer, 
createBackToMenuButton}
from './createElements.js'

import { drawPaddle, drawBall, drawScore, drawUsernames, drawWinMessage, drawPauseMenu, hidePauseMenu,
updateRematchButtonText }
from './drawing.js'

import { movePaddles, moveBall, checkBallPaddleCollision, keyDownHandler, keyUpHandler }
from './gameDynamics.js'

import { getPaddleAction, GameData }
from './ai.js';

import { loadUserManagementData }
from '../../views/dashboard/dashboard.js';

import { startCountdown, checkCountdown }
from './preGame.js';

import { fillingResults }
from './postGame.js';

import { prepareSinglePlayer }
from './onePlayer.js';
import { checkElement } from './utils.js';

/***********************************************\
-				RENDERING						-
\***********************************************/
export function renderPong()
{
	const	container = createContainer();
	const	video = createVideo();
	const	overlay = createOverlay();

	container.appendChild(video);
	container.appendChild(overlay);
	container.appendChild(createWinningMessage());
	container.appendChild(createRematchButton());
	container.appendChild(createBackToMenuButton());
	container.appendChild(createCanvas());
	container.appendChild(createPausedGifContainer());

	return container;
}

/***********************************************\
-				INITIALIZE PONG					-
\***********************************************/
export function initializePong()
{
	if (DEBUG)
		console.log('Initializing Pong...');

	resetNames();

	requestAnimationFrame(() =>
	{
		setupCanvas();
		setupMenuButtons();
		setupEventListeners();
		setupCanvasDimensions();
	});
}

function setupCanvas()
{
	document.body.classList.add('no-scroll');
	GraphConf.canvas = document.getElementById("pongCanvas");

	if (checkElement(GraphConf.canvas, 'Canvas') === false)
		return;

	GraphConf.ctx = GraphConf.canvas.getContext("2d");

	if (checkElement(GraphConf.ctx, 'Canvas context') === false)
		return;
}

function setupMenuButtons()
{
	const buttons =
	{
		singleplayerButton: document.getElementById('singleplayer-button'),
		twoplayerButton: document.getElementById('twoplayer-button'),
		tournamentButton: document.getElementById('tournament-button'),
		rematchButton: document.getElementById('rematch-button'),
		backtomenuButton: document.getElementById('back-to-menu-button'),
		menuOverlay: document.getElementById('menu-overlay'),
	};

	const	missingButtons = Object.entries(buttons)
		.filter(([_, button]) => !button)
		.map(([name]) => name);

	if (missingButtons.length > 0)
	{
		console.error('Missing menu buttons:', missingButtons.join(', '));
		return;
	}

	buttons.rematchButton.classList.add('hidden-sudden');
	buttons.backtomenuButton.classList.add('hidden-sudden');

	buttons.singleplayerButton.addEventListener('click', () => prepareSinglePlayer(buttons.menuOverlay));
	buttons.twoplayerButton.addEventListener('click', () => prepareTwoPlayers(buttons.menuOverlay));
	buttons.tournamentButton.addEventListener('click', () => prepareTournament(buttons.menuOverlay));

	buttons.rematchButton.addEventListener('click', () =>
	{
		if (GameState.isTournament === true)
		{
			if (GameState.isFinalMatch === false)
			{
				tournamentNextMatch();
			}
			else
			{
				setupFinalMatch();
			}
		}
		else
		{
			resetGame();
		}
	});
}

function setupEventListeners()
{
	if (GameState.areEventsListenersSetup === false)
	{
		window.addEventListener('resize', handleResize);
		document.addEventListener("keydown", keyDownHandler);
		document.addEventListener("keyup", keyUpHandler);
	}
	GameState.areEventsListenersSetup = true;
}

function setupCanvasDimensions()
{
	const	setCanvasDimensions = () =>
	{
		const	viewportHeight = window.innerHeight;
		GraphConf.canvas.width = viewportHeight * 0.8;
		GraphConf.canvas.height = viewportHeight * 0.6;
	};

	setCanvasDimensions();
}

function handleResize()
{
	setupCanvasDimensions();
	enforceMinimumWindowSize();
}

function enforceMinimumWindowSize()
{
	if (window.innerWidth < GraphConf.minWidth || window.innerHeight < GraphConf.minHeight)
	{
		window.resizeTo(Math.max(window.innerWidth, GraphConf.minWidth), Math.max(window.innerHeight, GraphConf.minHeight));
	}
}

export function startGame()
{
	if (GraphConf.canvas)
	{
		GraphConf.canvas.style.zIndex = 1;
	}

	GameState.isGameModeSelected = true;

	player1.y = (GraphConf.canvas.height - PaddleConf.height) / 2;
	player2.x = GraphConf.canvas.width - PaddleConf.width - PaddleConf.offset;
	player2.y = (GraphConf.canvas.height - PaddleConf.height) / 2;
	
	BallConf.x = GraphConf.canvas.width / 2;
	BallConf.y = GraphConf.canvas.height / 2;

	randomizeBall();

	window.addEventListener('resize', () =>
	{
		player2.x = GraphConf.canvas.width - PaddleConf.width - PaddleConf.offset;
	});

	GameState.game_done = false;
	gameLoop();
}

function randomizeBall()
{
	const	MIN_ANGLE = Math.PI / 6;
	const	MAX_ANGLE = Math.PI / 3;

	BallConf.speed = 5;
	
	let	direction;
	if (Math.random() < 0.5)
	{
		direction = -1;
	}
	else
	{
		direction = 1;
	}

	const	angle = MIN_ANGLE + Math.random() * (MAX_ANGLE - MIN_ANGLE);

	BallConf.dx = BallConf.speed * Math.cos(angle) * direction;
	BallConf.dy = BallConf.speed * Math.sin(angle);
}

/***********************************************\
 -					AI							-
 \***********************************************/

/* imports the function that returns the AI paddle's movement */

let	data = new GameData();

function updateGameData()
{
	data.ballX = BallConf.x;
	data.ballY = BallConf.y;
	data.ball_radius = BallConf.radius;
	data.ballX_velocity = BallConf.dx;
	data.ballY_velocity = BallConf.dy;

	data.fieldY_top = 0;
	data.fieldY_bottom = GraphConf.canvas.height;
	data.fieldX_right = GraphConf.canvas.width;

	data.paddleY = player2.y;
	data.paddle_height = PaddleConf.height;
	data.paddle_width = PaddleConf.width;
}

/* Exports the current game data held inside the data class.
The information hold inside this class can differ from the actual 
current game info, since the data class is only updated once per 
second thanks to the time interval created inside gameLoop(). */
export function update_game_data()
{
	return data;
}

/* All possible returns from getPaddleAction() */
const	DOWN = 0
const	UP = 1
const	ERROR = 42

function simulateKeyPress(key)
{
	document.dispatchEvent(new KeyboardEvent('keydown', { key: key }));
}

function simulateKeyRelease(key)
{
	document.dispatchEvent(new KeyboardEvent('keyup', { key: key }));
}

/* Simulates a key press from the AI's paddle */
function moveAiPaddle()
{

/* 	if (getPaddleAction() == ERROR)
		STOP THE GAME */
	if (getPaddleAction() == UP)
	{
		simulateKeyPress('ArrowUp');
		setTimeout(() =>
		{
			simulateKeyRelease('ArrowUp');
		}, 50);
	}
	else if (getPaddleAction() == DOWN)
	{
		simulateKeyPress('ArrowDown');
		setTimeout(() =>
		{
			simulateKeyRelease('ArrowUp');
		}, 50);
	}
}

/***********************************************\
-				GAME STATUS						-
\***********************************************/

let	startTime;
let	elapsedSeconds;
let	current_sec;

/***			Main Loop					***/
export async function gameLoop()
{
	if (GameState.game_paused == true)
	{
		if (GameState.animationFrameId)
		{
			cancelAnimationFrame(GameState.animationFrameId);
		}

		drawPauseMenu();
		GameState.animationFrameId = requestAnimationFrame(gameLoop);
		return;
	}

	GraphConf.ctx.clearRect(0, 0, GraphConf.canvas.width, GraphConf.canvas.height);

	if (GameState.game_done == true)
	{
		return ;
	}
	
//---------------------------------- AI ----------------------------------
	if (GameState.AI_present == true)
	{
		// updates the game data for the AI file immediately before starting the time interval
		if (data.ball_horizontal == undefined)
		{
			startTime = Date.now();
			current_sec = 0;
			updateGameData();
		}
		elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
		// updates the game data every second
		if (current_sec != elapsedSeconds)
			updateGameData();
		current_sec = elapsedSeconds;

		moveAiPaddle();
}
//-----------------------------------------------------------------------

	movePaddles();
	moveBall();
	checkBallPaddleCollision();

	drawPaddle(player1);
	drawPaddle(player2);
	drawBall();
	drawScore();
	drawUsernames(player1.name, player2.name);

	if (player1.score === GameConf.maxScore)
	{
		checkTournamentWinner(player1.name);
		drawWinMessage(player1.name);
		fillingResults(1);
		GameState.game_done = true;
	}
	else if (player2.score === GameConf.maxScore)
	{
		checkTournamentWinner(player2.name);
		drawWinMessage(player2.name);
		fillingResults(2);
		GameState.game_done = true;
	}

	if (GameState.game_done == false)
	{
		GameState.animationFrameId = requestAnimationFrame(gameLoop);
	}
}

function checkTournamentWinner(winnerName)
{
	if (GameState.isTournament === true)
	{
		if (GameState.isFinalMatch == true)
		{
			GameState.isTournamentDone = true;
			GameConf.winners.push(winnerName);
			GameConf.tournamentWinner = winnerName;
			console.log(' tournament winner', GameConf.tournamentWinner);
			
			hideWinningMessage();
			showTournamentResults();
			return ;
		}
		GameConf.matchupIndex++;
		GameConf.winners.push(winnerName);
		console.log('GameConf.winners.length: ', GameConf.winners.length);
		
		if (GameConf.matchupIndex === 2)
		{
			if (GameConf.winners.length === 2)
			{
				GameState.isFinalMatch = true;
				console.log('Setting up final match');
				console.log(' GameConf', GameConf);
				console.log(' GameState', GameState);
				updateRematchButtonText();
				return;
			}
		}
	}
}

function showTournamentResults()
{
	const	resultsContainer = document.createElement('div');
	resultsContainer.className = 'matchups-container';

	// Create and display the tournament winner
	const	winnerElement = document.createElement('h2');
	winnerElement.className = 'tournament-winner';
	winnerElement.textContent = `🏆 ${GameConf.tournamentWinner.toUpperCase()} IS THE TOURNAMENT WINNER! 🏆`;
	resultsContainer.appendChild(winnerElement);

	// Append the results container to the DOM
	document.body.appendChild(resultsContainer);

	const	backButton = createBackToMenuButton();
	resultsContainer.appendChild(backButton);
}

function resetTournament()
{
	// Reset tournament-related variables
	GameState.isTournament = false;
	GameState.isFinalMatch = false;
	GameState.isTournamentDone = false;
	GameConf.winners = [];
	GameConf.matchupIndex = 0;

	// Reset scores and prepare for a new game
	resetScores();
	resetGame();
}

function resetNames()
{
	player2.name = "";
}

/***			Resetting Game				***/
export function resetGame()
{
	// Reset game state
	resetScores();
	randomizeBall();
	hideWinningMessage();

	// Restart the game
	GameState.game_done = false;
	GameState.isGameModeSelected = true;

	if (DEBUG)
		console.log('GameState', GameState);

	setupEventListeners();
	requestAnimationFrame(gameLoop);
}

function resetScores()
{
	player1.score = 0;
	player2.score = 0;
}


function hideWinningMessage()
{
	const	messageElement = document.getElementById('winning-message');
	const	rematchButton = document.getElementById('rematch-button');
	messageElement.classList.remove('show');
	rematchButton.classList.add('hidden-sudden');
}