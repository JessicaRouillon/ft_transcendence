/***********************************************\
-			IMPORTING GLOBAL VARIABLES			-
\***********************************************/
import { DEBUG } from '../../main.js';

/***********************************************\
*                   RENDERING                   *
\***********************************************/

export default function renderProfile()
{
    // Create a container for the profile information
    const container = document.createElement('div');
    container.setAttribute('id', 'profile-container');

    // Create title for the profile
    const profileTitle = document.createElement('h1');
    profileTitle.textContent = 'My Profile';

    // Create section for personal information
    const personalInfoSection = document.createElement('section');
    personalInfoSection.setAttribute('id', 'personal-info');

    const personalInfoTitle = document.createElement('h2');
    personalInfoTitle.textContent = 'Personal Information';

    // Create elements for user data
    const firstNameElement = document.createElement('p');
    firstNameElement.setAttribute('id', 'first_name');

    const lastNameElement = document.createElement('p');
    lastNameElement.setAttribute('id', 'last_name');

    const usernameElement = document.createElement('p');
    usernameElement.setAttribute('id', 'username');
    
    const dobElement = document.createElement('p');
    dobElement.setAttribute('id', 'date_of_birth');

    const passwordElement = document.createElement('p');
    passwordElement.setAttribute('id', 'password');

    const changePasswordButton = document.createElement('button');
    changePasswordButton.setAttribute('id', 'change-password-button');
    changePasswordButton.textContent = 'Change Password';

    const emailElement = document.createElement('p');
    emailElement.setAttribute('id', 'email');

    // Append elements to container
    personalInfoSection.appendChild(personalInfoTitle);
    personalInfoSection.appendChild(firstNameElement);
    personalInfoSection.appendChild(lastNameElement);
    personalInfoSection.appendChild(usernameElement);
    personalInfoSection.appendChild(dobElement);
    personalInfoSection.appendChild(passwordElement);
    personalInfoSection.appendChild(changePasswordButton);
    personalInfoSection.appendChild(emailElement);

     // Create a logout button
     const logoutButton = document.createElement('button');
     logoutButton.setAttribute('id', 'logout-button');
     logoutButton.textContent = 'Log Out';
 
     // Append all elements to container
     container.appendChild(profileTitle);
     container.appendChild(personalInfoSection);
     container.appendChild(logoutButton);

    // Fetch user data and display it
    fetchUserData()
        .then(userData =>
        {
            if (userData && DEBUG)
                console.log(userData);
            else
                console.log('No user data found');

            firstNameElement.textContent = `First Name: ${userData.first_name}`;
            lastNameElement.textContent = `Last Name: ${userData.last_name}`;
            usernameElement.textContent = `Username: ${userData.username}`;
            dobElement.textContent = `Date of Birth: ${userData.date_of_birth || 'Not provided'}`;
            emailElement.textContent = `Email: ${userData.email}`;

            // Password display in asterisks
            const password = userData.password;
            const numAsterisks = Math.max(0, password.length); // Subtracting 3 for "Password: "
            const passwordText = `Password: ${'*'.repeat(numAsterisks)}`;
            passwordElement.textContent = passwordText;

        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            container.innerHTML = '<p>Failed to load profile data.</p>';
        });

    // Add event listener for logout button
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/sign-in';
    });

    // TODO: Voir la redirection pour le changement de mot de passe
    // Add event listener for change password button
    changePasswordButton.addEventListener('click', () => {
        window.location.href = '/change-password'; // Assuming you have a change password page
    });

    return container;
}


// Fetch user data from the API
async function fetchUserData()
{
    const token = localStorage.getItem('access_token');

    if (!token)
        throw new Error('No access token found');

    return fetch('/api/users/currentlyLoggedInUser/',
    {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token, // Add JWT to the Authorization header
        }
    })
    .then(response =>
    {
        if (!response.ok)
            throw new Error('Failed to fetch user data');
        return response.json();
    })
    .then(data =>
    {
        if (DEBUG)
            console.log('User data fetched:', data);
        return data;
    });
}


async function refreshToken()
{
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken)
        throw new Error('No refresh token found');

    return fetch('/api/token/refresh/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.access) {
            localStorage.setItem('access_token', data.access);
            return data.access;
        }
		else
            throw new Error('Failed to refresh token');
    });
}

