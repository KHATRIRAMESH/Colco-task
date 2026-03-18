async function getUsers() {
  const response = await fetch("/api/users", {
    credentials: "same-origin",
  });
  const data = await response.json();
  console.log("Fetched users:", data);
  return data;
}

async function getArtists() {
  const response = await fetch("/api/artists", {
    credentials: "same-origin",
  });
  const data = await response.json();
  return data;
}

async function createArtist(artistData) {
  const response = await fetch("/api/artist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(artistData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create artist");
  }
  return data;
}

async function createArtistManager(userData) {
  const response = await fetch("/api/users", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create artist manager");
  }

  return data;
}

// API call to register a new user
async function registerUser(userData) {
  const response = await fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
}

// API call to log in a user
async function logIn(userData) {
  const response = await fetch("/api/login", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  console.log("Login response data:", data);
  stateManage.setLogin(data);
  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }
  return data;
}

async function logOut() {
  const response = await fetch("/api/logout", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  stateManage.logOut();
  if (!response.ok) {
    throw new Error(data.message || "Logout failed");
  }
  return data;
}
