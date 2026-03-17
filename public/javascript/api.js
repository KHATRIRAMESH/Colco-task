async function getUsers() {
    const response = await fetch('/api/users');
    const data = await response.json();
    return data;
}


// API call to register a new user
async function registerUser(userData) {
    const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
    }
    return data;
}


// API call to log in a user
async function logIn(userData) {
    const response = await fetch('/api/login', {
        method: "POST",
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Login failed');
    }
    return data;
}

async function logOut() {
    const response = await fetch('/api/logout', {
        method: "POST",
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
    }
    return data;
}