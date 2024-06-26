document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("token") === "loggedIn";
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email"); // Assuming email is also stored in localStorage

  if (isLoggedIn && username) {
    const accountLink = document.getElementById("account-link");
    const usernameDisplay = document.getElementById("username-display");
    if (accountLink && usernameDisplay) {
      accountLink.style.display = "inline";
      usernameDisplay.textContent = username;
    }
    document.getElementById("login-link").style.display = "none";
    document.getElementById("register-link").style.display = "none";
    document.getElementById("logout-link").style.display = "inline";
  }

  if (email) {
    const accountEmail = document.getElementById("account-email");
    if (accountEmail) {
      accountEmail.textContent = email;
    }
  }

  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      window.location.href = "index.html";
    });
  }
});

// Register event listener
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const username = document.getElementById("username").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      if (password !== confirmPassword) {
        displayError("register-error", "Passwords do not match");
        return;
      }

      try {
        const response = await fetch("/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, username }),
        });

        if (response.ok) {
          const result = await response.json();
          localStorage.setItem("token", result.token);
          localStorage.setItem("username", username);
          localStorage.setItem("email", email);
          window.location.href = "index.html";
        } else {
          const errorText = await response.text();
          if (errorText === "User already exists with this email address") {
            displayError(
              "register-error",
              "User already exists with this email address"
            );
          } else if (errorText === "User already exists with this username") {
            displayError(
              "register-error",
              "User already exists with this username"
            );
          } else {
            displayError(
              "register-error",
              "This account already exists. Please go to the login page."
            );
          }
        }
      } catch (error) {
        console.error("Error:", error);
        displayError(
          "register-error",
          "An error occurred while trying to register. Please try again later."
        );
      }
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      try {
        const response = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const result = await response.json();
          localStorage.setItem("token", result.token);
          localStorage.setItem("username", result.username);
          localStorage.setItem("email", result.email);
          window.location.href = "index.html";
        } else {
          const errorText = await response.text();
          displayError("login-error", errorText);
        }
      } catch (error) {
        console.error("Error:", error);
        displayError(
          "login-error",
          "An error occurred while trying to login. Please try again later."
        );
      }
    });
  }
});

// Function to display error messages
function displayError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

// Other DOMContentLoaded event listeners for category items
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category");

  if (category) {
    const categoryHeader = document.getElementById("category-header");
    if (categoryHeader) {
      categoryHeader.textContent =
        category.charAt(0).toUpperCase() + category.slice(1);
    }

    try {
      const response = await fetch(`/items?category=${category}`);
      const items = await response.json();
      const itemsContainer = document.getElementById("items-container");
      if (itemsContainer) {
        itemsContainer.innerHTML = items
          .map(
            (item) => `
                    <a href="item-details.html?id=${item._id}" class="item">
                        <img src="${item.image}" alt="${item.itemName}">
                        <h3>${item.itemName}</h3>
                        <p>${item.desiredItem}</p>
                    </a>
                `
          )
          .join("");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }
});

// DOMContentLoaded event listener for exchange modal
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("exchange-modal");
  const btn = document.getElementById("exchange-request-btn");
  const span = document.getElementsByClassName("close")[0];
  const form = document.getElementById("exchange-form");
  const userItemsSelect = document.getElementById("user-items");

  if (btn) {
    btn.onclick = async () => {
      modal.style.display = "block";

      // Fetch user's items to populate the select dropdown
      try {
        const response = await fetch("/user-items"); // Adjust the endpoint as needed
        const userItems = await response.json();

        if (userItemsSelect) {
          userItemsSelect.innerHTML = userItems
            .map(
              (item) => `
                        <option value="${item._id}">${item.itemName}</option>
                    `
            )
            .join("");
        }
      } catch (error) {
        console.error("Error fetching user items:", error);
      }
    };
  }

  if (span) {
    span.onclick = () => {
      modal.style.display = "none";
    };
  }

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  // Handle form submission
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const selectedItem = userItemsSelect.value;
      const message = document.getElementById("exchange-message").value;
      const urlParams = new URLSearchParams(window.location.search);
      const itemId = urlParams.get("id");

      try {
        const response = await fetch("/exchange-request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selectedItem, message, itemId }),
        });
        const result = await response.json();
        if (result.success) {
          alert("Exchange request sent successfully!");
          modal.style.display = "none";
        } else {
          alert("Error sending exchange request.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });
  }
});
