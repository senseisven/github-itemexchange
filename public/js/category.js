document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    if (category) {
        document.getElementById('category-header').textContent = category.charAt(0).toUpperCase() + category.slice(1);
        fetchItemsByCategory(category);
    }

    const isLoggedIn = localStorage.getItem('token') === 'loggedIn';

    const signinLink = document.getElementById('signin-link');
    const registerLink = document.getElementById('register-link');
    const uploadLink = document.getElementById('upload-link');
    const accountLink = document.getElementById('account-link');
    const signoutLink = document.getElementById('signout-link');

    if (isLoggedIn) {
        signinLink.style.display = 'none';
        registerLink.style.display = 'none';
        uploadLink.style.display = 'inline';
        accountLink.style.display = 'inline';
        signoutLink.style.display = 'inline';
    } else {
        signinLink.style.display = 'inline';
        registerLink.style.display = 'inline';
        uploadLink.style.display = 'inline'; // Show upload link for all
        accountLink.style.display = 'none';
        signoutLink.style.display = 'none';
    }

    signoutLink.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
});

async function fetchItemsByCategory(category) {
    try {
        const response = await fetch(`/items?category=${category}`);
        const items = await response.json();
        const itemsContainer = document.getElementById('items-container');
        itemsContainer.innerHTML = items.map(item => `
            <div class="item">
                <h3>${item.itemName}</h3>
                <img src="${item.image}" alt="${item.itemName}">
                <p><strong>Desired Item:</strong> ${item.desiredItem}</p>
                <p class="item-description">${item.description}</p>
            </div>
        `).join('');

        // Add click event to show description
        const itemElements = document.querySelectorAll('.item');
        itemElements.forEach(item => {
            item.addEventListener('click', () => {
                const description = item.querySelector('.item-description');
                description.style.display = description.style.display === 'none' ? 'block' : 'none';
            });
        });

        // Log image paths for debugging
        console.log('Items:', items);

    } catch (error) {
        console.error('Error fetching items:', error);
    }
}
