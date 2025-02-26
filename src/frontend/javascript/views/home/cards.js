/***********************************************\
-					IMPORTS						-
\***********************************************/
import { DEBUG } from '../../main.js';

/***********************************************\
-				IMPORTING SCRIPTS				-
\***********************************************/
import { createWhatIsPongButton, createTheTeamButton }
from './buttons.js';

import { createElementWithClass, createImage, createTextElement,
createCardHeader, createButton }
from './utils.js'

/***********************************************\
-					CARDS						-
\***********************************************/
export function createWhatIsPongCard()
{
	if (DEBUG)
		console.log('Creating What is Pong Card');

	const	col = createElementWithClass('div', 'mb-auto');
	const	card = createElementWithClass('div', 'card');
	const	cardHeader = createElementWithClass('div', 'card-header d-flex justify-content-center');
	cardHeader.id = 'headingWhatisPong';
		
	const	button = createWhatIsPongButton();

	cardHeader.appendChild(button);
	card.appendChild(cardHeader);

	const	collapse = createElementWithClass('div', 'collapse');
	collapse.id = 'multiCollapseExample1';
	collapse.setAttribute('aria-labelledby', 'headingWhatisPong');

	const	cardBody = createElementWithClass('div', 'card-body rounded-3 card-pong');
	const	row = createElementWithClass('div', 'row');

	const	gifCol = createElementWithClass('div', 'col-md-6 d-flex justify-content-center align-items-center');
	const	gifElement = createImage('../../../assets/images/home/what_is_pong/what_is_pong.gif', 'Pong GIF', 'img-fluid');
	gifCol.appendChild(gifElement);

	const	textCol = createElementWithClass('div', 'col-md-6 d-flex flex-column justify-content-center align-items-center');
		
	const	textElement = createTextElement(`
		Pong is a classic arcade video game released in 1972 by Atari.<br>
		It's one of the earliest and simplest video games, designed to simulate table tennis (ping-pong).<br><br><br>
		In Pong, two players control paddles on either side of the screen, moving them up and down to hit a ball back and forth.<br>
		The goal is to score points by making the ball pass the opponent's paddle.<br><br><br>
		The game's simplicity, with basic two-dimensional graphics and straightforward controls, made it a foundational title in video game history, helping to popularize video gaming worldwide.
	`);

	const	moreInfoLink = createButton(
	{
		className: 'btn btn-second mt-auto py-auto',
		text: 'More Info',
		href: 'https://en.wikipedia.org/wiki/Pong',
		fontSize: '12px',
		padding: '4px 8px',
		target: '_blank'
	});

	textCol.appendChild(textElement);
	textCol.appendChild(moreInfoLink);

	row.appendChild(gifCol);
	row.appendChild(textCol);
	cardBody.appendChild(row);

	collapse.appendChild(cardBody);
	card.appendChild(collapse);
	col.appendChild(card);

	return col;
}

export function createTheTeamCard()
{
	if (DEBUG)
		console.log('Creating The Team Card');

	const	col = createElementWithClass('div', 'mb-auto');
	const	card = createElementWithClass('div', 'card');

	const	button = createTheTeamButton();
	const	cardHeader = createCardHeader(button, 'headingtheTeam');

	const	collapse = createElementWithClass('div', 'collapse');
	collapse.id = 'multiCollapseExample2';
	collapse.setAttribute('aria-labelledby', 'headingtheTeam');

	const	cardBody = createElementWithClass('div', 'card-body rounded-3 text-center');

	const	row = createElementWithClass('div', 'row');

	const	frames = 
	[
		{
			title: 'Carolina<br>Somarriba<br>',
			imgSrc: '../../../assets/images/home/the_team/photos/caro_team.jpg',
			linkedIn: 'https://www.linkedin.com/in/carolina-somarriba-2303a812a/',
			github: 'https://github.com/casomarr'
		},
		{
			title: 'Jessica<br>Rouillon<br>',
			imgSrc: '../../../assets/images/home/the_team/photos/jess_team.jpg',
			linkedIn: 'https://www.linkedin.com/in/jessica-rouillon-37a22053/',
			github: 'https://github.com/JessicaRouillon'
		},
		{
			title: 'Clément<br>Bernazeau<br>',
			imgSrc: '../../../assets/images/home/the_team/photos/clement_team.jpg',
			linkedIn: 'https://www.linkedin.com/in/cl%C3%A9ment-bernazeau-9a89a4182/',
			github: 'https://github.com/ClementBrz'
		},
		{
			title: 'Karl<br>Querel<br>',
			imgSrc: '../../../assets/images/home/the_team/photos/karl_team.jpeg',
			linkedIn: 'https://www.linkedin.com/in/karlquerel/',
			github: 'https://github.com/KarlQuerel'
		}
	];

	frames.forEach(frame => {
		const	frameCol = createElementWithClass('div', 'col-md-3 mb-0');
		const	frameCard = createElementWithClass('div', 'card h-100 clickable-frame');

		const	img = createImage(frame.imgSrc, frame.title, 'card-img');
		frameCard.appendChild(img);

		const	cardBody = createElementWithClass('div', 'card-body text-center');
		const	title = createElementWithClass('h5', 'frame-title');
		title.innerHTML = frame.title;

		const	btnContainer = createElementWithClass('div', 'd-flex justify-content-center align-items-center');
		btnContainer.style.gap = '10px';

		const	linkedInBtn = document.createElement('a');
		linkedInBtn.href = frame.linkedIn;
		linkedInBtn.className = 'btn btn-icon';
		linkedInBtn.target = '_blank';

		const	linkedInIconDefault = document.createElement('img');
		linkedInIconDefault.src = '../../../assets/images/home/the_team/icons/linkedin_default.svg';
		linkedInIconDefault.alt = 'LinkedIn Logo';
		linkedInIconDefault.className = 'linkedin-icon linkedin-icon-default';

		const	linkedInIconHover = document.createElement('img');
		linkedInIconHover.src = '../../../assets/images/home/the_team/icons/linkedin_hover.svg';
		linkedInIconHover.alt = 'LinkedIn Hover Logo';
		linkedInIconHover.className = 'linkedin-icon linkedin-icon-hover';

		linkedInBtn.appendChild(linkedInIconDefault);
		linkedInBtn.appendChild(linkedInIconHover);

		const	githubBtn = document.createElement('a');
		githubBtn.href = frame.github;
		githubBtn.className = 'btn btn-icon';
		githubBtn.target = '_blank';

		const	githubIconDefault = document.createElement('img');
		githubIconDefault.src = '../../../assets/images/home/the_team/icons/github_default.svg';
		githubIconDefault.alt = 'GitHub Logo';
		githubIconDefault.className = 'github-icon github-icon-default';

		const	githubIconHover = document.createElement('img');
		githubIconHover.src = '../../../assets/images/home/the_team/icons/github_hover.svg';
		githubIconHover.alt = 'GitHub Hover Logo';
		githubIconHover.className = 'github-icon github-icon-hover';

		githubBtn.appendChild(githubIconDefault);
		githubBtn.appendChild(githubIconHover);

		btnContainer.appendChild(linkedInBtn);
		btnContainer.appendChild(githubBtn);

		cardBody.appendChild(title);
		cardBody.appendChild(btnContainer);
		frameCard.appendChild(cardBody);

		frameCol.appendChild(frameCard);
		row.appendChild(frameCol);
	});

	cardBody.appendChild(row);

	collapse.appendChild(cardBody);
	card.appendChild(cardHeader);
	card.appendChild(collapse);
	col.appendChild(card);

	return col;
}