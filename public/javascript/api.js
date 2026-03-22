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

// API call to fetch all users
async function getUsers({ page = 1, limit = 10 } = {}) {
  const response = await fetch(`/api/users?page=${page}&limit=${limit}`, {
    credentials: "same-origin",
    method: "GET",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch users");
  }
  console.log("Users fetched from API:", data);
  return data;
}

// API call to create a new artist
async function getArtists({ page = 1, limit = 10 } = {}) {
  const response = await fetch(`/api/artists?page=${page}&limit=${limit}`, {
    credentials: "same-origin",
    method: "GET",
  });
  return await response.json();
}

// API call to create a new artist
async function createArtist(artistData) {
  const response = await fetch("/api/artists", {
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

// API call to create a new artist manager user
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

// API call to update an existing user
async function updateUser(userId, userData) {
  const response = await fetch(`/api/users/${userId}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update user");
  }
  return data;
}

// API call to delete an existing user
async function deleteUser(userId) {
  const response = await fetch(`/api/users/${userId}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete user");
  }
  return data;
}

async function getSongs(page, limit) {
  const response = await fetch(`/api/songs?page=${page}&limit=${limit}`, {
    credentials: "same-origin",
    method: "GET",
  });
  return await response.json();
}

async function createSong(songData) {
  const response = await fetch("/api/songs", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(songData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create song");
  }
  return data;
}

async function updateArtist(artistId, artistData) {
  const response = await fetch(`/api/artists/${artistId}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(artistData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update artist");
  }
  return data;
}

async function deleteArtist(artistId) {
  const response = await fetch(`/api/artists/${artistId}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete artist");
  }
  return data;
}

async function updateSong(songId, songData) {
  const response = await fetch(`/api/songs/${songId}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(songData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update song");
  }
  return data;
}

async function deleteSong(songId) {
  const response = await fetch(`/api/songs/${songId}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete song");
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
  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }
  stateManage.setLogin(data);
  return data;
}

// API call to log out the current user
async function logOut() {
  const response = await fetch("/api/logout", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Logout failed");
  }
  stateManage.logOut();
  return data;
}
