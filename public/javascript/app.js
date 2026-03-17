const backToLoginBtn = document.getElementById('back-to-login');
const backToRegisterBtn = document.getElementById('back-to-register');
const logInForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logOutBtn = document.getElementById('logout-button');

if (logInForm) {
    logInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            alert('Email and password are required');
            return;
        }

        const payload = { email, password };

        console.log("Payload for login:", payload);

        try {
            const result = await logIn(payload);
            alert(result.message || 'Login successful');
            window.location.href = '/dashboard.html';
        } catch (error) {
            alert(error.message || 'Login failed');
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const countryCode = document.getElementById('countryCode').value;
        const phone = document.getElementById('phone').value.trim();
        const dob = document.getElementById('date-of-birth').value;
        const gender = document.getElementById('gender').value;
        const address = document.getElementById('address').value.trim();

        const payload = {
            firstName,
            lastName,
            email,
            password,
            phone: `${countryCode}${phone}`,
            dob,
            gender,
            address
        };

        console.log('Registering user with payload:', payload);

        try {
            const result = await registerUser(payload);
            alert(result.message || 'Registration successful');
            window.location.href = '/login.html';
        } catch (error) {
            alert(error.message || 'Registration failed');
        }
    });
}


if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', () => {
        window.location.href = '/login.html';
    });
}

if (backToRegisterBtn) {
    backToRegisterBtn.addEventListener('click', () => {
        window.location.href = '/register.html';
    });
}

if (logOutBtn) {
    logOutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            console.log('Logout button clicked');
            const confirmLogout = confirm('Are you sure you want to log out?');
            if (!confirmLogout) {
                return;
            }
            const result = await logOut();
            alert(result.message || 'Logout successful');
            window.location.href = '/login.html';
        } catch (error) {
            alert(error.message || 'Logout failed');
        }
    })
}
async function loadUsers() {
    const data = await getUsers();
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
}