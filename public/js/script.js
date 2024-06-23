document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('token') === 'loggedIn';
    const username = localStorage.getItem('username');

    if (isLoggedIn && username) {
        const accountLink = document.getElementById('account-link');
        const usernameDisplay = document.getElementById('username-display');
        if (accountLink && usernameDisplay) {
            accountLink.style.display = 'inline';
            usernameDisplay.textContent = username;
        }
        document.getElementById('signin-link').style.display = 'none';
        document.getElementById('register-link').style.display = 'none';
        document.getElementById('signout-link').style.display = 'inline';
    }
});


document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    if (category) {
        document.getElementById('category-header').textContent = category.charAt(0).toUpperCase() + category.slice(1);

        try {
            const response = await fetch(`/items?category=${category}`);
            const items = await response.json();
            const itemsContainer = document.getElementById('items-container');
            itemsContainer.innerHTML = items.map(item => `
                <div class="item">
                    <img src="${item.image}" alt="${item.itemName}">
                    <h3>${item.itemName}</h3>
                    <p>${item.desiredItem}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }
});
