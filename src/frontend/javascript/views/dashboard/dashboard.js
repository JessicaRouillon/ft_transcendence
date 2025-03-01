/* **********************************************\
-			IMPORTING VARIABLES/FUNCTIONS		-
\***********************************************/
import { DEBUG, GITHUBACTIONS }
from '../../main.js';

import { apiRequest }
from '../user/signin.js';

import { getAuthHeaders, getCookie }
from '../user/signin.js';

/***********************************************\
*				 RENDERING				 *
\***********************************************/

export function renderDashboard()
{
	// Container
	const	dashboard = document.createElement('div');
	dashboard.id = 'dashboard-container';
	dashboard.classList.add('dashboard-container');

	// Title
	const	title = document.createElement('h1');
	title.id = 'dashboard-title';
	title.textContent = 'Your Dashboard';
	dashboard.appendChild(title);

	// Create buttons container
	const	buttonsContainer = document.createElement('div');
	buttonsContainer.id = 'dashboard-buttons-container';

	// My Stats
	const	statsButton = document.createElement('div');
	statsButton.classList.add('btn', 'btn-home', 'btn-dashboard');
	statsButton.id = 'statsButton';
	statsButton.textContent = 'My Stats';

	statsButton.addEventListener('click', () =>
	{
		myStatsContainer.classList.toggle('active');
	});
		
	// My Game History
	const	myGameHistory = document.createElement('div');
	myGameHistory.classList.add('btn', 'btn-home', 'btn-dashboard');
	myGameHistory.id = 'myGameHistory';
	myGameHistory.textContent = 'My Game History';

	// My Rank
	const	rankButton = document.createElement('div');
	rankButton.classList.add('btn', 'btn-home', 'btn-dashboard');
	rankButton.id = 'rankButton';
	rankButton.textContent = 'My Rank';

	buttonsContainer.appendChild(statsButton);
	buttonsContainer.appendChild(myGameHistory);
	buttonsContainer.appendChild(rankButton);

	dashboard.appendChild(buttonsContainer);

	// Mystats Container
	const	myStatsContainer = document.createElement('div');
	myStatsContainer.classList.add('container');
	myStatsContainer.id = 'mystats-container';

	// Close Button for the Charts Container
	const	closeButton = document.createElement('button');
	closeButton.classList.add('btn', 'btn-home', 'close-btn');
	closeButton.textContent = 'Close';

	closeButton.addEventListener('click', () =>
	{
		myStatsContainer.classList.remove('active');
	});

	myStatsContainer.appendChild(closeButton);

	// My Stats Canvas
	const	myStatsCanvas = document.createElement('canvas');
	myStatsCanvas.id = 'mystats-canvas';
	myStatsContainer.appendChild(myStatsCanvas);

	dashboard.appendChild(myStatsContainer);
	return dashboard;
}

/***********************************************\
-				MAIN FUNCTION					-
\***********************************************/

export async function initializeDashboard()
{
	const	gameHistory = await loadUserGameHistory();
	const	allUsers = await loadAllUsers();

	setupEventListeners(gameHistory, allUsers);
}

/***********************************************\
-					FETCHING DATA				-
\***********************************************/

export async function loadUserGameHistory()
{
	try
	{
		const	gameHistory = await apiRequest('/api/dashboard/getGameHistory/', {
			method: 'GET',
			headers: {
				...getAuthHeaders(),
			},
		});

		if (DEBUG)
			console.log("gameHistory= ", gameHistory);
		if (GITHUBACTIONS)
			console.log("Successfully fetched connected user's game history");
		return gameHistory;
	}
	catch (error)
	{
		console.error("Error fetching connected user's game history");
		throw error;
	}
}

async function loadAllUsers()
{
	try
	{
		const	response = await apiRequest('/api/users/getAllUsers/', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('token')}`,
				'Content-Type': 'application/json',
			},
		});

		if (GITHUBACTIONS)
			console.log("Successfully fetched all users");

		return response;

	}
	catch (error)
	{
		console.error("Error fetching users' avatars:", error);

		if (error.response)
		{
			const	errorText = await error.response.text();
			console.error("Response text:", errorText);
		}

		throw error;
	}
}

function getAvatar(userID, avatar)
{
	apiRequest(`/api/users/getFriendAvatar/${userID}`, {
		method: 'GET',
	})
	.then(userData =>{
		if (DEBUG)
			console.log(userData);

		avatar.src = `data:image/png;base64,${userData.avatar}`;
	})
	.catch(error => {
		console.error('Error fetching user data:', error);
	})
}

async function loadSpecificUserGameHistory(username)
{
	try
	{
		const	gameHistory = await apiRequest(`/api/dashboard/getSpecificUserGameHistory/?username=${username}`,
		{
			method: 'GET',
			headers: {

				'X-CSRFToken': getCookie('csrftoken'),
				'Content-Type': 'application/json',
			},
		});

		if (DEBUG)
			console.log("gameHistory= ", gameHistory);
		if (GITHUBACTIONS)
			console.log("Successfully fetched the user's game history");
		return gameHistory;
	}
	catch (error)
	{
		console.error("Error fetching connected user's game history");
		throw error;
	}
}

/***********************************************\
-				EVENT LISTENERS					-
\***********************************************/

function setupEventListeners(gameHistory, allUsers)
{	
	const	chartButton = document.getElementById('statsButton');
	const	gameHistoryButton = document.getElementById('myGameHistory');
	const	trophyButton = document.getElementById('rankButton');

	if (chartButton)
	{
		chartButton.addEventListener('click', function ()
		{
			chartPieData(gameHistory);
			favouritePlayingBuddy(gameHistory, allUsers);
		});
	}
	else
	{
		console.error('Button element with id "chart_button" not found.');
	}

	if (gameHistoryButton)
	{
		gameHistoryButton.addEventListener('click', function ()
		{
			avatars(gameHistory, allUsers);
		});
	}
	else
	{
		console.error('Button element with id "myGameHistory" not found.');
	}

	if (trophyButton)
	{
		trophyButton.addEventListener('click', function ()
		{
			badge(gameHistory, allUsers);
		});
	}
	else
	{
		console.error('Button element with id "trophy_button" not found.');
	}
}

/***********************************************\
-					CHART ICON					-
\***********************************************/
function chartPieData(gameHistory)
{
	// Count the number of victories and defeats
	let nb_of_victories = gameHistory.filter(game => game.myScore > game.opponentScore).length;
	let nb_of_defeats = gameHistory.filter(game => game.myScore < game.opponentScore).length;

	const	myStatsCanvas = document.getElementById('mystats-canvas');
	if (!myStatsCanvas)
	{
		console.error('Canvas element with id "mystats-canvas" not found.');
		return;
	}

	const	ctx = myStatsCanvas.getContext('2d');
	if (!ctx)
	{
		console.error('Unable to get context for "mystats-canvas".');
		return;
	}

	// Clear the canvas
	ctx.clearRect(0, 0, myStatsCanvas.width, myStatsCanvas.height);

	// Calculate angles for the pie chart
	const	totalGames = nb_of_victories + nb_of_defeats;
	const	angles = [
		(nb_of_victories / totalGames) * 2 * Math.PI,
		(nb_of_defeats / totalGames) * 2 * Math.PI
	];

	// Define colors
	const	styles = getComputedStyle(document.documentElement);
	const	colors = [
		styles.getPropertyValue('--base-light-blue').trim(), // Wins
		styles.getPropertyValue('--base-light-red').trim() // Losses
	];

	// Draw the pie chart
	const	centerX = myStatsCanvas.width / 2;
	const	centerY = myStatsCanvas.height / 2;
	const	radius = Math.min(myStatsCanvas.width, myStatsCanvas.height) / 2 - 10;

	let startAngle = Math.PI / 2;

	angles.forEach((angle, index) => {
		ctx.fillStyle = colors[index];
		ctx.beginPath();
		ctx.moveTo(centerX, centerY);
		ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
		ctx.closePath();
		ctx.fill();

		// Calculate the position for the label
		const	labelAngle = startAngle + angle / 2;
		const	labelX = centerX + (radius / 2) * Math.cos(labelAngle);
		const	labelY = centerY + (radius / 2) * Math.sin(labelAngle);

		// Set text style and draw the label
		ctx.fillStyle = '#DAEE01';
		ctx.font = "15px 'Press Start 2P', cursive";
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		let	labelText;
		if (totalGames === 1)
		{
			labelText = '100%';

			if (index === 0)
				labelText = '100%';
			else
				labelText = '';
		}
		else
		{
			if (index === 0)
				labelText = Math.round(nb_of_victories / totalGames * 100) + '%';
			else
				labelText = Math.round(nb_of_defeats / totalGames * 100) + '%';
		}
		ctx.fillText(labelText, labelX, labelY);

		startAngle += angle;
	});

	// Remove any existing legend
	const	existingLegend = document.querySelector('.chart-legend');
	if (existingLegend) {
		existingLegend.remove();
	}

	// Create a stylable legend below the chart
	const	legendContainer = document.createElement('div');
	legendContainer.className = 'chart-legend';
	const	legendLabels = ['Wins', 'Losses'];

	legendLabels.forEach((label, index) => {
		const	legendItem = document.createElement('div');
		legendItem.className = 'legend-item';

		// Color box
		const	colorBox = document.createElement('span');
		colorBox.className = 'color-box';
		colorBox.style.backgroundColor = colors[index];

		// Label text
		const	labelText = document.createElement('span');
		labelText.className = 'label-text';
		labelText.textContent = label;

		legendItem.appendChild(colorBox);
		legendItem.appendChild(labelText);
		legendContainer.appendChild(legendItem);
	});

	// Insert the legend after the chart
	myStatsCanvas.parentNode.insertBefore(legendContainer, myStatsCanvas.nextSibling);
	
	// Custom message
	let	messageContainer = document.querySelector('.chart-message');
	if (!messageContainer)
	{
		messageContainer = document.createElement('div');
		messageContainer.className = 'chart-message';

		if (nb_of_victories > nb_of_defeats)
		{
			messageContainer.style.color = 'var(--base-green)';
			messageContainer.textContent = "You are doing great!";
		}
		else if (nb_of_defeats > nb_of_victories)
		{
			messageContainer.style.color = 'var(--base-red)';
			messageContainer.textContent = "You are getting behind!";
		}
		else
		{
			messageContainer.textContent = "You are evenly matched!";
		}

		// Insert the message below the legend
		myStatsCanvas.parentNode.insertBefore(messageContainer, legendContainer.nextSibling);
	}
}

/***********************************************\
-				FRIENDS ICON					-
\***********************************************/

function avatars(gameHistory, allUsers)
{
	// Create the main container for game info
	const	mygameinfocontainer = document.createElement('div');
	mygameinfocontainer.id = 'mygameinfocontainer';
	mygameinfocontainer.classList.add('container', 'mygameinfocontainer');


	// Create a close button
	const closeButton = document.createElement('button');
	closeButton.classList.add('btn', 'btn-home', 'close-btn', 'btn-avatar-close');
	closeButton.textContent = 'Close';

	// Add event listener to close the mygameinfocontainer
	closeButton.addEventListener('click', () =>
	{
		mygameinfocontainer.remove();
	});

	// Append the close button to the mygameinfocontainer
	mygameinfocontainer.appendChild(closeButton);


	// Create a row to hold the avatar boxes
	const	row = document.createElement('div');
	row.classList.add('row');

	// Collect unique opponent usernames from game history
	const	opponentsList = [];
	gameHistory.forEach(game =>
	{
		if (!opponentsList.includes(game.opponentUsername))
		{
			opponentsList.push(game.opponentUsername);
		}
	});

	// Loop through all users and create avatar boxes for opponents
	allUsers.forEach(user =>
		{
		if (opponentsList.includes(user.username))
			{
			// Create a column for each avatar
			const	col = document.createElement('div');
			col.classList.add('col-md-4', 'mb-3');

			const	avatarBox = document.createElement('div');
			avatarBox.className = 'avatar-box';
			avatarBox.dataset.username = user.username;

			const	avatarImg = document.createElement('img');
			avatarImg.src = getAvatar(user.id, avatarImg);
			avatarImg.alt = `${user.username}`;
			avatarImg.classList.add('img-fluid', 'avatar-icon');

			avatarBox.appendChild(avatarImg);

			// Create and append the username under the avatar image
			const	usernameText = document.createElement('p');
			usernameText.textContent = user.username;
			usernameText.className = 'username-text';

			avatarBox.appendChild(usernameText);
			col.appendChild(avatarBox);
			row.appendChild(col);

			// Add click event to display game history
			avatarBox.addEventListener('click', () =>
			{
				displayGameHistory(gameHistory.username, user.username, gameHistory);
			});

			// Remove the processed username from opponentsList
			opponentsList.splice(opponentsList.indexOf(user.username), 1);
		}
	});

	// Handle remaining opponents without user data
	opponentsList.forEach(opponent =>
		{
		const	col = document.createElement('div');
		col.classList.add('col-md-4', 'mb-3');

		const	avatarBox = document.createElement('div');
		avatarBox.className = 'avatar-box';
		avatarBox.dataset.username = opponent;

		const avatarImg = document.createElement('img');
		if (opponent === 'deleted_user') {
			avatarImg.src = '/assets/images/dashboard/deleted_user.png';
		} else if (opponent === '🤖 Ponginator3000 🤖') {
			avatarImg.src = '/assets/images/dashboard/robot.png';
		} else {
			avatarImg.src = '/assets/images/dashboard/default.png';
		}
		avatarImg.alt = `${opponent}`;
		avatarImg.className = 'avatar-icon';

		// Create and append the username under the avatar image
		const	noAccountUsernameText = document.createElement('p');
		noAccountUsernameText.textContent = opponent;
		noAccountUsernameText.className = 'username-text';

		avatarBox.appendChild(avatarImg);
		avatarBox.appendChild(noAccountUsernameText);
		col.appendChild(avatarBox);
		row.appendChild(col);

		// Add click event to display game history
		avatarBox.addEventListener('click', () =>
		{
			displayGameHistory(gameHistory.username, opponent, gameHistory);
		});
	});

	// Append the row to the container
	mygameinfocontainer.appendChild(row);

	// Append the container to the dashboard
	document.getElementById('dashboard-container').appendChild(mygameinfocontainer);

	return mygameinfocontainer;
}

function displayGameHistory(connectedUser, chosenOpponent, gameHistory) {
// Create an overlay
const overlay = document.createElement('div');
overlay.classList.add('overlay');

// Add event listener to prevent clicks on the overlay
overlay.addEventListener('click', (e) => e.stopPropagation());

// Create a container for the game history
const gameHistoryContainer = document.createElement('div');
gameHistoryContainer.classList.add('container', 'game-history-container');

// Create a header for the game history
const header = document.createElement('div');
header.classList.add('game-history-header');
header.textContent = `Game History with ${chosenOpponent}`;
gameHistoryContainer.appendChild(header);

// Create a close button
const closeButton = document.createElement('div');
closeButton.classList.add('btn', 'btn-home', 'close-btn', 'game-history-close');
closeButton.textContent = 'X';

// Close button functionality to remove the game history container and overlay
closeButton.addEventListener('click', () => {
gameHistoryContainer.remove();
overlay.remove();
});

// Append the close button to the game history container
gameHistoryContainer.appendChild(closeButton);

// Create a table element to display game history
const table = document.createElement('table');
table.classList.add('game-history-table');

// Create the table header
const tableHeaderRow = document.createElement('tr');
tableHeaderRow.classList.add('game-history-header-row');

const dateHeader = document.createElement('th');
dateHeader.textContent = 'Date';
dateHeader.classList.add('game-history-header-cell');
tableHeaderRow.appendChild(dateHeader);

const username1Header = document.createElement('th');
username1Header.textContent = connectedUser;
username1Header.classList.add('game-history-header-cell');
tableHeaderRow.appendChild(username1Header);

const username2Header = document.createElement('th');
username2Header.textContent = chosenOpponent;
username2Header.classList.add('game-history-header-cell');
tableHeaderRow.appendChild(username2Header);

// Append the header row to the table
table.appendChild(tableHeaderRow);

// Call function to add game history to the table
addGameHistory(connectedUser, chosenOpponent, gameHistory, table);

// Append the table to the game history container
gameHistoryContainer.appendChild(table);

// Append the overlay and game history container to the dashboard or another element
const dashboard = document.getElementById('dashboard-container');
if (dashboard) {
// Remove any existing game history containers and overlays before appending new ones
const existingOverlay = document.querySelector('.overlay');
const existingGameHistory = document.querySelector('.game-history-container');
if (existingOverlay) existingOverlay.remove();
if (existingGameHistory) existingGameHistory.remove();

dashboard.appendChild(overlay);
dashboard.appendChild(gameHistoryContainer);
} else {
console.error("Dashboard container not found.");
}
}


function addGameHistory(connectedUser, chosenOpponent, gameHistory, table)
{
	// Clear any existing content in the table
	table.innerHTML = '';

	// Create the header row
	const	headerRow = document.createElement('tr');
	headerRow.classList.add('game-history-header-row'); // Add your custom class

	const	dateHeader = document.createElement('th');
	dateHeader.textContent = 'Date';
	dateHeader.classList.add('game-history-header-cell'); // Add your custom class
	headerRow.appendChild(dateHeader);

	const	myUsernameHeader = document.createElement('th');
	myUsernameHeader.textContent = 'Me';
	myUsernameHeader.classList.add('game-history-header-cell'); // Add your custom class
	headerRow.appendChild(myUsernameHeader);

	const	opponentUsernameHeader = document.createElement('th');
	opponentUsernameHeader.textContent = chosenOpponent;
	opponentUsernameHeader.classList.add('game-history-header-cell'); // Add your custom class
	headerRow.appendChild(opponentUsernameHeader);

	// Append the header row to the table
	table.appendChild(headerRow);

	// Iterate through the game history and add rows for each match
	gameHistory.forEach(game => {
		if (game.opponentUsername === chosenOpponent) {
			// Create a row for the match details
			const	matchRow = document.createElement('tr');
			matchRow.classList.add('game-history-row'); // Add your custom class

			// Date cell
			const	dateCell = document.createElement('td');
			dateCell.textContent = new Date(game.date).toLocaleDateString();
			dateCell.classList.add('game-history-cell'); // Add your custom class
			matchRow.appendChild(dateCell);

			// My score cell
			const	myScoreCell = document.createElement('td');
			myScoreCell.textContent = game.myScore;
			myScoreCell.classList.add('game-history-cell'); // Add your custom class
			matchRow.appendChild(myScoreCell);

			// Opponent's score cell
			const	opponentScoreCell = document.createElement('td');
			opponentScoreCell.textContent = game.opponentScore;
			opponentScoreCell.classList.add('game-history-cell'); // Add your custom class
			matchRow.appendChild(opponentScoreCell);

			// Append the match row to the table
			table.appendChild(matchRow);
		}
	});
}

/***********************************************\
-				TROPHY ICON					-
\***********************************************/

async function retrieveAllUserStats(allUsers)
{
	const	allStats = [];

	// allUsers.forEach(user =>
	for (const user of allUsers) ///instead of forEch because await underneeth does not work otherwise
	{
		const	stats =
		{
			username: user.username,
			nb_of_victories: 0,
			nb_of_defeats: 0,
			success_percentage: 0,
			ranking_position: 0
		};

		const games = await loadSpecificUserGameHistory(stats.username);

		if (DEBUG)
		{
			console.log("user: ", stats.username);
			console.log("games: ", games);
		}

		games.forEach(game =>
		{
			if (game.myUsername == user.username)
			{
				if (game.myScore > game.opponentScore)
				{
					stats.nb_of_victories++;
				}
				else
				{
					stats.nb_of_defeats++;
				}
			}
		});
		allStats.push(stats);
	};

	allStats.forEach(user =>
	{
		const totalGames = user.nb_of_victories + user.nb_of_defeats;
		if (totalGames > 0)
			user.success_percentage = (user.nb_of_victories / totalGames) * 100;
	});

	return allStats;
}

function retrieveConnectedUserRanking(allStats, connectedUser)
{
	// Assign the ranking position to each user based on success_percentage
	allStats.forEach(user => {
		user.ranking_position = 1 + allStats.filter(otherUser => otherUser.success_percentage > user.success_percentage).length;
	});

	// Find the connected user's stats
	const userStats = allStats.find(user => user.username === connectedUser);

	if (DEBUG)
	{
		console.log("connected user : ", connectedUser);
		console.log("success_percentage for ", userStats.username, " = ", userStats.success_percentage);
		console.log("ranking position for ", userStats.username, " = ", userStats.ranking_position);
	}

	return userStats.ranking_position;
}


async function badge(gameHistory, allUsers)
{
	let badgeImgSrc = '';
	let message = '';

	if (allUsers.length === 1)
	{
		message = " You are alone!";
		badgeImgSrc = '../../../assets/images/dashboard/alone.gif';
	}
	else
	{
		const allStats = await retrieveAllUserStats(allUsers);

		if (DEBUG)
			console.log("allStats: ", allStats);

		const rankingPosition = retrieveConnectedUserRanking(allStats, gameHistory[0].myUsername);

		// Determine the badge image and message
		if (rankingPosition > 3)
		{
			message = ' You need to improve!';
			badgeImgSrc = '../../../assets/images/dashboard/unranked.gif';
		}
		else if (rankingPosition === 3)
		{
			message = ' You are the 3rd best player!';
			badgeImgSrc = '../../../assets/images/dashboard/3rd.gif';
		}
		else if (rankingPosition === 2)
		{
			message = ` You are the 2nd best player!`;
			badgeImgSrc = '../../../assets/images/dashboard/2nd.gif';
		}
		else if (rankingPosition === 1)
		{
			message = " You are the best player ever!";
			badgeImgSrc = '../../../assets/images/dashboard/1st.gif';
		}
	}

	// Create the overlay element
	const overlay = document.createElement('div');
	overlay.classList.add('overlay');

	// Prevent clicking on the overlay
	overlay.addEventListener('click', (e) => e.stopPropagation());

	// Create a container for the badge display
	const badgeContainer = document.createElement('div');
	badgeContainer.classList.add('badge-container');

	// Create the badge image element
	const badgeIcon = document.createElement('img');
	badgeIcon.src = badgeImgSrc;
	badgeIcon.alt = 'Badge Icon';
	badgeIcon.classList.add('badge-icon');

	// Create the message element
	const badgeMessage = document.createElement('p');
	badgeMessage.textContent = message;
	badgeMessage.classList.add('badge-message');

	// Append the badge icon and message to the badge container
	badgeContainer.appendChild(badgeIcon);
	badgeContainer.appendChild(badgeMessage);

	// Create the close button
	const closeButton = document.createElement('div');
	closeButton.classList.add('btn', 'btn-home', 'close-btn', 'game-history-close', 'badge-btn-close');
	closeButton.textContent = 'X';

	// Close button functionality to remove both the badge container and overlay
	closeButton.addEventListener('click', () =>
	{
		badgeContainer.remove();
		overlay.remove();
	});

	// Append the close button to the badge container
	badgeContainer.appendChild(closeButton);

	// Append the badge container to the overlay
	overlay.appendChild(badgeContainer);

	// Append the overlay to the dashboard
	const dashboard = document.getElementById('dashboard-container');
	if (dashboard)
	{
		dashboard.appendChild(overlay);
	}
	else
	{
		console.error('Dashboard container not found!');
	}
}

/***********************************************\
-			FAVOURITE PLAYING BUDDY				-
 * *********************************************/

function favouritePlayingBuddy(gameHistory, allUsers)
{
	// Find the container where the chart is displayed
	const	myStatsContainer = document.getElementById('mystats-container');
	if (!myStatsContainer)
	{
		console.error('Container element with id "mystats-container" not found.');
		return;
	}

	// Clear any previous favorite buddy content within the container
	let favouriteBuddyContainer = document.querySelector('.favourite-buddy-container');
	if (favouriteBuddyContainer)
	{
		favouriteBuddyContainer.remove();
	}

	// Create a new container for the favorite buddy
	favouriteBuddyContainer = document.createElement('div');
	favouriteBuddyContainer.className = 'favourite-buddy-container';

	// Title
	const	favouriteBuddyTitle = document.createElement('h3');
	favouriteBuddyTitle.classList.add('favourite-buddy-title');
	favouriteBuddyTitle.textContent = 'Favorite Buddy';
	favouriteBuddyContainer.appendChild(favouriteBuddyTitle);

	// Create a sub-container for the avatar and name
	const	avatarNameContainer = document.createElement('div');
	avatarNameContainer.className = 'avatar-name-container'; // New container class

	// Find the most played opponent
	const	opponentsList = gameHistory.reduce((acc, game) =>
	{
		acc[game.opponentUsername] = (acc[game.opponentUsername] || 0) + 1;
		return acc;
	}, {});

	const	mostPlayedOpponent = Object.keys(opponentsList).reduce((a, b) => 
		opponentsList[a] > opponentsList[b] ? a : b
	);

	// Find the user object for the most played opponent
	const	mostPlayedUser = allUsers.find(user => user.username === mostPlayedOpponent);
	if (mostPlayedUser)
	{
		// Avatar Image
		const	avatarImg = document.createElement('img');
		avatarImg.className = 'avatar-icon';
		getAvatar(mostPlayedUser.id, avatarImg);
		avatarImg.alt = `${mostPlayedUser.username}`;

		// Buddy Name
		const	buddyName = document.createElement('span');
		buddyName.classList.add('favourite-buddy-name');
		buddyName.textContent = mostPlayedUser.username;

		// Append the avatar and name to the new container
		avatarNameContainer.appendChild(avatarImg);
		avatarNameContainer.appendChild(buddyName);

		// Append the new container to the main favorite buddy container
		favouriteBuddyContainer.appendChild(avatarNameContainer);
	}
	else
	{
		favouriteBuddyTitle.textContent = 'No favorite buddy found.';
	}

	// Append the favorite buddy container below the chart
	myStatsContainer.appendChild(favouriteBuddyContainer);
}