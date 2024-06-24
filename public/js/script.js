document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('token') === 'loggedIn';
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');

    if (isLoggedIn && username) {
        const accountLink = document.getElementById('account-link');
        const usernameDisplay = document.getElementById('username-display');
        if (accountLink && usernameDisplay) {
            accountLink.style.display = 'inline';
            usernameDisplay.textContent = username;
        }
        document.getElementById('login-link').style.display = 'none';
        document.getElementById('register-link').style.display = 'none';
        document.getElementById('logout-link').style.display = 'inline';
    }

    if (email) {
        const accountEmail = document.getElementById('account-email');
        if (accountEmail) {
            accountEmail.textContent = email;
        }
    }

    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('email');
            window.location.href = 'index.html';
        });
    }

    // Adding email to the upload form
    const uploadForm = document.querySelector('form[action="/upload"]');
    if (uploadForm) {
        uploadForm.addEventListener('submit', (event) => {
            const email = localStorage.getItem('email');
            if (email) {
                const emailInput = document.createElement('input');
                emailInput.type = 'hidden';
                emailInput.name = 'email';
                emailInput.value = email;
                uploadForm.appendChild(emailInput);
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('token') === 'loggedIn';
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');

    if (isLoggedIn) {
        const accountUsernameDisplay = document.getElementById('account-username');
        const accountEmailDisplay = document.getElementById('account-email');

        if (accountUsernameDisplay && accountEmailDisplay) {
            accountUsernameDisplay.textContent = username;
            accountEmailDisplay.textContent = email;
        }
    }
});

// Register event listener
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const username = document.getElementById('username').value;

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password, username }),
                });

                if (response.ok) {
                    const result = await response.json();
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('username', username);
                    localStorage.setItem('email', email);
                    window.location.href = 'index.html';
                } else {
                    const errorText = await response.text();
                    displayError('register-error', errorText);
                }
            } catch (error) {
                displayError('register-error', 'An error occurred. Please try again later.');
            }
        });
    }
});

// Login event listener
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                if (response.ok) {
                    const result = await response.json();
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('username', result.username);
                    localStorage.setItem('email', result.email);
                    window.location.href = 'index.html';
                } else {
                    const errorText = await response.text();
                    displayError('login-error', errorText);
                }
            } catch (error) {
                displayError('login-error', 'An error occurred. Please try again later.');
            }
        });
    }
});

// Function to display error messages
function displayError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Other DOMContentLoaded event listeners for category items
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    if (category) {
        const categoryHeader = document.getElementById('category-header');
        if (categoryHeader) {
            categoryHeader.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        }

        try {
            const response = await fetch(`/items?category=${category}`);
            const items = await response.json();
            const itemsContainer = document.getElementById('items-container');
            if (itemsContainer) {
                itemsContainer.innerHTML = items.map(item => `
                    <a href="item-details.html?id=${item._id}" class="item">
                        <img src="${item.image}" alt="${item.itemName}">
                        <h3>${item.itemName}</h3>
                        <p>${item.desiredItem}</p>
                    </a>
                `).join('');
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }
});

// DOMContentLoaded event listener for exchange modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('exchange-modal');
    const btn = document.getElementById('exchange-request-btn');
    const span = document.getElementsByClassName('close')[0];
    const form = document.getElementById('exchange-form');
    const userItemsSelect = document.getElementById('user-items');

    if (btn) {
        btn.onclick = async () => {
            modal.style.display = 'block';

            // Fetch user's items to populate the select dropdown
            try {
                const email = localStorage.getItem('email');
                const response = await fetch(`/user-items?email=${email}`); // Ensure email is passed
                const userItems = await response.json();

                if (userItemsSelect) {
                    userItemsSelect.innerHTML = userItems.map(item => `
                        <option value="${item._id}">${item.itemName}</option>
                    `).join('');
                }
            } catch (error) {
                console.error('Error fetching user items:', error);
            }
        };
    }

    if (span) {
        span.onclick = () => {
            modal.style.display = 'none';
        };
    }

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Handle form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const selectedItem = userItemsSelect.value;
            const message = document.getElementById('exchange-message').value;
            const urlParams = new URLSearchParams(window.location.search);
            const itemId = urlParams.get('id');

            try {
                const response = await fetch('/exchange-request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ selectedItem, message, itemId }),
                });
                const result = await response.json();
                if (result.success) {
                    alert('Exchange request sent successfully!');
                    modal.style.display = 'none';
                } else {
                    alert('Error sending exchange request.');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }
});

// Fetch and display user posts when "My Posts" button is clicked
document.addEventListener('DOMContentLoaded', () => {
    const myPostsButton = document.getElementById('my-posts-button');
    if (myPostsButton) {
        myPostsButton.addEventListener('click', async () => {
            const email = localStorage.getItem('email');
            if (email) {
                try {
                    const response = await fetch(`/user-posts?email=${email}`);
                    const userPosts = await response.json();
                    displayUserPosts(userPosts);
                } catch (error) {
                    console.error('Error fetching user posts:', error);
                    displayErrorBelowHeader('Failed to fetch user posts.');
                }
            }
        });
    }
});

function displayUserPosts(posts) {
    const container = document.createElement('div');
    container.classList.add('user-posts-container');

    if (posts.length === 0) {
        container.innerHTML = '<p>No posts found.</p>';
    } else {
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <h3>${post.itemName}</h3>
                <p>${post.description}</p>
                <p>Desired Item: ${post.desiredItem}</p>
                <img src="${post.image}" alt="${post.itemName}" style="max-width: 100%; height: auto;">
            `;
            container.appendChild(postElement);
        });
    }

    const mainContainer = document.querySelector('.container');
    mainContainer.innerHTML = ''; // Clear the existing content
    mainContainer.appendChild(container);
}

function displayErrorBelowHeader(message) {
    const errorContainer = document.createElement('div');
    errorContainer.classList.add('error-message');
    errorContainer.textContent = message;
    errorContainer.style.color = 'red';
    errorContainer.style.marginTop = '20px';

    const mainContainer = document.querySelector('.container');
    mainContainer.innerHTML = ''; // Clear the existing content
    mainContainer.appendChild(errorContainer);
}
