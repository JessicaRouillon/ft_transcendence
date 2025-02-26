/***********************************************\
-				GLOBAL VARIABLES				-
\***********************************************/
export	const	DEBUG = true;
export	const	GITHUBACTIONS = false;

/***********************************************\
-				IMPORTING SCRIPTS				-
\***********************************************/

/***			Page Not Found				***/
import { renderPageNotFound }
from "./views/error_404/error_404.js";

/***				GDPR					***/
import { initGDPRModal }
from "./views/privacy_policy/GDPR.js";

/***			Privacy Policy				***/
import { renderPrivacyPolicy, cleanUpPrivacyPolicy }
from "./views/privacy_policy/privacy_policy.js";

/***			Nav Bar						***/
import { renderNavbar }
from "./views/navbar/navbar.js";

/***			Footer						***/
import { renderFooter }
from "./views/footer/footer.js";

/***			Home						***/
import { renderHome }
from "./views/home/home.js";

/***			Pong						***/
import { renderPong, initializePong }
from "./components/pong/pong.js";

import { cleanUpPong }
from "./components/pong/postGame.js";

/***			Dashboard					***/
import { renderDashboard, initializeDashboard }
from "./views/dashboard/dashboard.js";

/***			Particles					***/
import { initParticles, destroyParticles }
from "./components/particles/particles.js"

/***			User						***/
import { render2fa }
from "./views/user/2fa.js";

import { renderSignIn, userPingBackend }
from "./views/user/signin.js";

import { renderProfile }
from "./views/user/profile.js";

import { renderFriendsList }
from "./views/user/friends.js";

import { renderSignUp, initializeSignUp }
from "./views/user/signup.js";

import { renderChangePassword, initializeChangePassword }
from "./views/user/change_password.js";

import { manageInactiveUsers }
from "./views/user/delete_inactive_users.js";


/***			Footer						***/

/***********************************************\
-				DEFINING ROUTES					-
\***********************************************/
const	routes =
{
	'/':
	{
		title: "Home",
		render: renderHome
	},
	'/home':
	{
		title: "Home",
		render: renderHome
	},
	'/privacy-policy':
	{
		title: "Privacy Policy",
		render: renderPrivacyPolicy,
		cleanup: cleanUpPrivacyPolicy
	},
	'/dashboard':
	{
		title: "Dashboard",
		render: renderDashboard,
		init: initializeDashboard
	},
	'/pong':
	{
		title: "Pong Game",
		render: renderPong,
		init: initializePong,
		cleanup: cleanUpPong
	},
	'/profile':
	{
		title: "My Profile",
		render: renderProfile,
	},
	'/404':
	{
		title: "Page Not Found",
		render: renderPageNotFound,
	},
	'/sign-up':
	{
		title: "Sign Up",
		render: renderSignUp,
		init: initializeSignUp
	},
	'/sign-in':
	{
		title: "Sign In",
		render: renderSignIn
	},
	'/friends':
	{
		title: "Friends List",
		render: renderFriendsList
	},
	'/2fa-verification':
	{
		title: "2FA Verification",
		render: render2fa
	},
	'/change-password':
	{
		title: "Change Password",
		render: renderChangePassword,
		init: initializeChangePassword
	},
};

/***********************************************\
-				FUNCTIONS						-
\***********************************************/

//	Initializing currentPath to an empty string
let	currentPath = '';

/***			Normalizing Paths			***/
function normalizePath(path)
{
	path = path.startsWith('/') ? path : '/' + path;
	return path.replace(/\/+$/, '') || '/';
}

/***			Authentication				***/
let	accessToken = localStorage.getItem('access_token');
let	isSignedIn = Boolean(accessToken);

export function setSignedInState(state)
{
	isSignedIn = state;
}

export function getSignedInState()
{
	return isSignedIn;
}

/***			Router Function				***/
function router()
{
	manageInactiveUsers();

	let path = normalizePath(window.location.pathname) || '/home';

	//	Assigning default path if none
	if (!path)
		path = '/home';

	const	previousRoute = routes[currentPath]
	const	route = routes[path] || routes['/404'];

	if (DEBUG)
	{
		console.log('Current path:', path);
		console.log('Route:', route);	
	}

	//	Clear previous route if necessary
	if (previousRoute && previousRoute.cleanup)
		previousRoute.cleanup();

	// Add this section to call cleanup for /pong on first load
	if (path === '/pong' && previousRoute !== route)
	{
		cleanUpPong();
	}
	
	if (DEBUG)
		console.log('isSignedIn = ', isSignedIn);


	const	restrictedPaths =
	{
		'/pong': "❌ You must be logged in to access the Pong game ❌",
		'/dashboard': "❌ You must be logged in to access your dashboard ❌",
		'/profile': "❌ You must be logged in to access your profile ❌",
		'/change-password': "❌ You must be logged in to change your password ❌",
		'/friends': "❌ You must be logged in to see your friends ❌"
	};
	
	// Check if the user is trying to access a restricted route
	if (isSignedIn == false && restrictedPaths[path])
	{
		alert(restrictedPaths[path]);
		navigateTo('/sign-in');
		return;
	}

	if (route)
	{
		document.title = route.title;
		const	renderedContent = route.render();
		const	appElement = document.getElementById('app');
		if (typeof renderedContent === 'string')
			appElement.innerHTML = renderedContent;
		else if (renderedContent instanceof HTMLElement)
		{
			appElement.innerHTML = '';
			appElement.appendChild(renderedContent);
		}

		// Initialize or destroy particles based on the route
		if (path !== '/pong')
		{
			initParticles();
		}
		else
		{
			destroyParticles();
			if (DEBUG)
				console.log('Particles effect disabled on /pong route');
		}

		if (route.init)
		{
			if (DEBUG)
				console.log('Initializing route:', path);
			route.init();
		}

		// Scrolling to the top of the page
		window.scroll(0, 0);

		if (path !== '/privacy-policy')
		{
			initGDPRModal();
		}
	}
	else
	{
		document.title = "Page not Found";
		document.getElementById('app').innerHTML = renderPageNotFound();
	}

	//	Updating currentPath to the new path
	currentPath = path;
}

/***		Navigation Function				***/
export function navigateTo(path)
{
	history.pushState(null, "", path);
	router();
}

window.navigateTo = navigateTo;

/***		Enabling Client-side Routing	***/
document.addEventListener("DOMContentLoaded", () =>
{

	// Rendering Navbar
	renderNavbar();

	// Rendering Footer
	renderFooter();

	document.body.addEventListener("click", (event) =>
	{
		const	link = event.target.closest("a[data-link]");
		
		if (link)
		{
			event.preventDefault();
			const	href = link.getAttribute('href');
			if (DEBUG)
				console.log(`Navigating to ${href}`);
			navigateTo(href);
		}
	});

	if (localStorage.getItem('access_token'))
	{
		if (DEBUG)
			console.log('je suis dans le main et je ping le back');
		userPingBackend();
	}

	window.addEventListener("popstate", router);

	router();
});