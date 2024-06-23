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
        document.getElementById('login-link').style.display = 'none';
        document.getElementById('register-link').style.display = 'none';
        document.getElementById('logout-link').style.display = 'inline';
    }
    
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.href = 'index.html';
        });
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
                <a href="item-details.html?id=${item._id}" class="item">
                    <img src="${item.image}" alt="${item.itemName}">
                    <h3>${item.itemName}</h3>
                    <p>${item.desiredItem}</p>
                </a>
            `).join('');
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('exchange-modal');
    const btn = document.getElementById('exchange-request-btn');
    const span = document.getElementsByClassName('close')[0];
    const form = document.getElementById('exchange-form');
    const userItemsSelect = document.getElementById('user-items');

    btn.onclick = async () => {
        modal.style.display = 'block';

        // Fetch user's items to populate the select dropdown
        try {
            const response = await fetch('/user-items'); // Adjust the endpoint as needed
            const userItems = await response.json();

            userItemsSelect.innerHTML = userItems.map(item => `
                <option value="${item._id}">${item.itemName}</option>
            `).join('');
        } catch (error) {
            console.error('Error fetching user items:', error);
        }
    }

    span.onclick = () => {
        modal.style.display = 'none';
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // Handle form submission
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
});
