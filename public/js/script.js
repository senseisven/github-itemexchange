document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("token") === "loggedIn";
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");

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

  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      window.location.href = "index.html";
    });
  }

  // Adding email to the upload form
  const uploadForm = document.querySelector('form[action="/upload"]');
  if (uploadForm) {
    uploadForm.addEventListener("submit", (event) => {
      const email = localStorage.getItem("email");
      if (email) {
        const emailInput = document.createElement("input");
        emailInput.type = "hidden";
        emailInput.name = "email";
        emailInput.value = email;
        uploadForm.appendChild(emailInput);
      }
    });
  }

  // Populate account information
  const accountUsernameDisplay = document.getElementById("account-username");
  const accountEmailDisplay = document.getElementById("account-email");

  if (isLoggedIn) {
    if (accountUsernameDisplay) {
      accountUsernameDisplay.textContent = username;
    }
    if (accountEmailDisplay) {
      accountEmailDisplay.textContent = email;
    }
  }

  // Event listener for the Propose Exchange button
  const proposeExchangeButton = document.getElementById(
    "propose-exchange-button"
  );
  if (proposeExchangeButton) {
    proposeExchangeButton.addEventListener("click", () => {
      const itemId = new URLSearchParams(window.location.search).get("id"); // Get the itemId from the URL
      window.location.href = `exchange-verification.html?itemId=${itemId}`;
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
          displayError("register-error", errorText);
        }
      } catch (error) {
        displayError(
          "register-error",
          "An error occurred. Please try again later."
        );
      }
    });
  }
});

// Login event listener
document.addEventListener("DOMContentLoaded", () => {
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
        displayError(
          "login-error",
          "An error occurred. Please try again later."
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

// Fetch and display items based on the category
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
                        <img src="${item.images[0]}" alt="${item.itemName}">
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

// Fetch and display user items for the dropdown in the exchange verification page
document.addEventListener("DOMContentLoaded", async () => {
  const email = localStorage.getItem("email");
  const itemId = new URLSearchParams(window.location.search).get("itemId"); // Get the itemId from the URL

  if (email && itemId) {
    try {
      // Fetch the item the user wants to receive
      const receiveItemResponse = await fetch(`/item/${itemId}`);
      const receiveItem = await receiveItemResponse.json();

      document.getElementById("receive-item-image").src = receiveItem.images[0];
      document.getElementById("receive-item-title").textContent =
        receiveItem.itemName;
      document.getElementById("receive-item-description").textContent =
        receiveItem.description;

      // Fetch the user's items for the dropdown
      const userItemsResponse = await fetch(`/user-items?email=${email}`);
      const userItems = await userItemsResponse.json();
      const userItemsSelect = document.getElementById("user-items");

      if (userItems.length > 0) {
        userItems.forEach((item) => {
          const option = document.createElement("option");
          option.value = item._id;
          option.textContent = item.itemName;
          userItemsSelect.appendChild(option);
        });
      } else {
        const noItemsOption = document.createElement("option");
        noItemsOption.value = "";
        noItemsOption.textContent = "No items available for exchange";
        userItemsSelect.appendChild(noItemsOption);
      }

      // Handle selection change in dropdown
      userItemsSelect.addEventListener("change", () => {
        const selectedItem = userItems.find(
          (item) => item._id === userItemsSelect.value
        );
        if (selectedItem) {
          document.getElementById("exchange-item-image").src =
            selectedItem.images[0];
          document.getElementById("exchange-item-title").textContent =
            selectedItem.itemName;
          document.getElementById("exchange-item-description").textContent =
            selectedItem.description;
        }
      });

      // Handle send proposal button
      document
        .getElementById("send-proposal-button")
        .addEventListener("click", async () => {
          const selectedItemId = userItemsSelect.value;

          const response = await fetch("/exchange-request", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              selectedItem: selectedItemId,
              message: "Exchange proposal",
              itemId: itemId,
            }),
          });

          if (response.ok) {
            alert("Exchange proposal sent successfully!");
          } else {
            alert("Failed to send exchange proposal.");
          }
        });
    } catch (error) {
      console.error("Error:", error);
    }
  }
});

// Fetch and display user posts when the "My Posts" page loads
document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname.includes("my-posts.html")) {
    const email = localStorage.getItem("email");
    if (email) {
      try {
        const response = await fetch(`/user-posts?email=${email}`);
        const userPosts = await response.json();
        const myPostsContainer = document.getElementById("my-posts-container");
        if (myPostsContainer) {
          myPostsContainer.innerHTML = userPosts
            .map(
              (post) => `
                        <div class="post">
                            <img src="${post.images[0]}" alt="${post.itemName}">
                            <div class="post-content">
                                <h3>${post.itemName}</h3>
                                <p><strong>Desired Item:</strong> ${post.desiredItem}</p>
                                <p>${post.description}</p>
                            </div>
                        </div>
                    `
            )
            .join("");
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    }
  }
});

// Fetch and display user posts when the "My Posts" button is clicked
const myPostsButton = document.getElementById("my-posts-button");
if (myPostsButton) {
  myPostsButton.addEventListener("click", async () => {
    const email = localStorage.getItem("email");
    if (email) {
      try {
        const response = await fetch(`/user-posts?email=${email}`);
        const userPosts = await response.json();
        displayUserPosts(userPosts);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    }
  });
}

function displayUserPosts(posts) {
  const container = document.createElement("div");
  container.classList.add("items-container");

  if (posts.length === 0) {
    container.innerHTML = "<p>No posts found.</p>";
  } else {
    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.classList.add("item");
      postElement.innerHTML = `
                <a href="item-details.html?id=${post._id}" class="item">
                    <img src="${post.images[0]}" alt="${post.itemName}">
                    <h3>${post.itemName}</h3>
                    <p><strong>Desired Item:</strong> ${post.desiredItem}</p>
                    <button class="btn" onclick="editPost('${post._id}')">Edit Post</button>
                </a>
            `;
      container.appendChild(postElement);
    });
  }

  const mainContainer = document.querySelector(".container");
  mainContainer.innerHTML = ""; // Clear the existing content
  mainContainer.appendChild(container);
}

window.editPost = (postId) => {
  window.location.href = `edit-post.html?id=${postId}`;
};
