const backToLoginBtn = document.getElementById("back-to-login");
const backToRegisterBtn = document.getElementById("back-to-register");
const logInForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const logOutBtn = document.getElementById("logout-button");
const usersTabBtn = document.getElementById("tab-users");
const artistsTabBtn = document.getElementById("tab-artists");
const tabContent = document.getElementById("tab-content");
const dashboardTitle = document.getElementById("dashboard-title");

//form for creating the Artist Manager.
function getCreateArtistManagerFormHtml() {
  return `
        <section class="content-block">
            <h3>Create Artist Manager</h3>
            <form id="create-artist-manager-form" class="inline-form">
                <input type="text" id="am-first-name" placeholder="First Name" required />
                <input type="text" id="am-last-name" placeholder="Last Name" required />
                <input type="email" id="am-email" placeholder="Email" required />
                <input type="password" id="am-password" placeholder="Password" required />
                <input type="tel" id="am-phone" placeholder="Phone (optional)" />
                <select id="am-gender">
                    <option value="">Gender (optional)</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
                <input type="text" id="am-address" placeholder="Address (optional)" />
                <button type="submit">Create Artist Manager</button>
            </form>
        </section>
    `;
}

// Form for creating an Artist.
function getCreateArtistFormHtml() {
  return `
        <section class="content-block">
            <h3>Create Artist</h3>
            <form id="create-artist-form" class="inline-form">
                <input type="text" id="artist-name" placeholder="Artist Name" required />
                <input type="date" id="artist-dob" placeholder="Date of Birth" required />
                <select id="artist-gender">
                    <option value="">Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
                <input type="text" id="artist-address" placeholder="Address (optional)" />
                <input type="date" id="artist-first-release" placeholder="First Release Year"/>
                <input type="number" id="artist-albums-released" placeholder="Number of Albums Released" />

                <button type="submit">Create Artist</button>
            </form>
        </section>
    `;
}

function getCreateSongFormHtml() {
  return `
        <section class="content-block">
            <h3>Create Song</h3>
            <form id="create-song-form" class="inline-form">
                <input type="text" id="song-name" placeholder="Song Name" required />
                <input type="text" id="song-genre" placeholder="Genre" required />
                <select id="song-artist">
                    <option value="">Select Artist</option>
                </select>
                <button type="submit">Create Song</button>
            </form>
        </section>
    `;
}

function renderRows(title, rows, columns) {
  if (!tabContent) {
    return;
  }

  if (!rows || rows.length === 0) {
    tabContent.innerHTML = `<h2>${title}</h2><p>No records found.</p>`;
    return;
  }

  const headerRow = columns
    .map((column) => `<th>${column.label}</th>`)
    .join("");
  const bodyRows = rows
    .map((row) => {
      const cells = columns
        .map((column) => `<td>${row[column.key] ?? ""}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  tabContent.innerHTML = `
        <h2>${title}</h2>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>${headerRow}</tr>
          </thead>
          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </div>
    `;
}

function resolveCurrentRole(role) {
  if (typeof role === "string" && role.length > 0) {
    return role;
  }

  return stateManage.getUser()?.role;
}

function getRoleBasedFormHtml(role) {
  if (role === "super_admin") {
    return getCreateArtistManagerFormHtml();
  }

  if (role === "artist_manager") {
    return getCreateArtistFormHtml();
  }

  if (role === "artist") {
    return getCreateSongFormHtml();
  }

  return "";
}

function showAccessDenied(message) {
  if (!tabContent) {
    return;
  }
  tabContent.innerHTML = `<h2>Access Denied</h2><p>${message}</p>`;
}

function initializeDashboardByRole() {
  if (!tabContent) {
    return;
  }

  const currentUser = stateManage.getUser();
  console.log("Current user on dashboard load:", currentUser);
  if (!currentUser) {
    window.location.href = "/login.html";
    return;
  }

  const firstName = currentUser.first_name || currentUser.firstName || "User";
  const role = currentUser.role || "unknown";

  if (dashboardTitle) {
    dashboardTitle.textContent = `Welcome to Dashboard, ${firstName}`;
  }

  stateManage.render();

  if (role === "super_admin") {
    if (usersTabBtn) usersTabBtn.style.display = "block";
    if (artistsTabBtn) artistsTabBtn.style.display = "block";
    loadUsersTab(role);
    return;
  }

  if (role === "artist_manager") {
    if (usersTabBtn) usersTabBtn.style.display = "none";
    if (artistsTabBtn) artistsTabBtn.style.display = "block";
    loadArtistsTab(role);
    return;
  }

  if (role === "artist") {
    if (usersTabBtn) usersTabBtn.style.display = "none";
    if (artistsTabBtn) artistsTabBtn.style.display = "none";
    tabContent.innerHTML = `
      <h2>Songs</h2>
      <p>Role: artist</p>
      ${getCreateSongFormHtml()}
    `;
    return;
  }

  showAccessDenied(
    "Your account role is not authorized for dashboard content.",
  );
}

async function loadUsersTab(role) {
  if (!tabContent) {
    return;
  }

  tabContent.innerHTML = "<p>Loading users...</p>";
  try {
    const currentRole = resolveCurrentRole(role);
    if (currentRole !== "super_admin") {
      showAccessDenied("Only super_admin can access the Users section.");
      return;
    }

    const data = await getUsers();
    const rows = data.users || [];
    renderRows("Users", rows, [
      { key: "id", label: "ID" },
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "address", label: "Address" },
      { key: "role", label: "Role" },
    ]);

    const roleBasedFormHtml = getRoleBasedFormHtml(currentRole);

    if (roleBasedFormHtml) {
      tabContent.insertAdjacentHTML("beforeend", roleBasedFormHtml);
    }

    const createForm = document.getElementById("create-artist-manager-form");
    if (createForm) {
      createForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
          firstName: document.getElementById("am-first-name").value.trim(),
          lastName: document.getElementById("am-last-name").value.trim(),
          email: document.getElementById("am-email").value.trim(),
          password: document.getElementById("am-password").value,
          phone: document.getElementById("am-phone").value.trim(),
          gender: document.getElementById("am-gender").value,
          address: document.getElementById("am-address").value.trim(),
        };

        try {
          const result = await createArtistManager(payload);
          alert(result.message || "Artist manager created successfully");
          await loadUsersTab(currentRole);
        } catch (error) {
          alert(error.message || "Failed to create artist manager");
        }
      });
    }
  } catch (error) {
    tabContent.innerHTML = `<p>Failed to load users: ${error.message}</p>`;
  }
}

async function loadArtistsTab(role) {
  if (!tabContent) {
    return;
  }

  tabContent.innerHTML = "<p>Loading artists...</p>";
  try {
    const currentRole = resolveCurrentRole(role);
    if (currentRole !== "super_admin" && currentRole !== "artist_manager") {
      showAccessDenied(
        "Only super_admin and artist_manager can access the Artists section.",
      );
      return;
    }

    const data = await getArtists();
    renderRows("Artists", data.artists || [], [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "gender", label: "Gender" },
      { key: "address", label: "Address" },
      { key: "first_release_year", label: "First Release Year" },
    ]);

    const roleBasedFormHtml = getRoleBasedFormHtml(currentRole);
    if (roleBasedFormHtml && currentRole === "artist_manager") {
      tabContent.insertAdjacentHTML("beforeend", roleBasedFormHtml);
    }
  } catch (error) {
    tabContent.innerHTML = `<p>Failed to load artists: ${error.message}</p>`;
  }
}

if (logInForm) {
  logInForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    const payload = { email, password };

    console.log("Payload for login:", payload);

    try {
      const result = await logIn(payload);
      stateManage.setLogin(result);
      alert(result.message || "Login successful");
      window.location.href = "/dashboard.html";
    } catch (error) {
      alert(error.message || "Login failed");
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const countryCode = document.getElementById("countryCode").value;
    const phone = document.getElementById("phone").value.trim();
    const dob = document.getElementById("date-of-birth").value;
    const gender = document.getElementById("gender").value;
    const address = document.getElementById("address").value.trim();

    const payload = {
      firstName,
      lastName,
      email,
      password,
      phone: `${countryCode}${phone}`,
      dob,
      gender,
      address,
    };

    console.log("Registering user with payload:", payload);

    try {
      const result = await registerUser(payload);
      alert(result.message || "Registration successful");
      window.location.href = "/login.html";
    } catch (error) {
      alert(error.message || "Registration failed");
    }
  });
}

if (backToLoginBtn) {
  backToLoginBtn.addEventListener("click", () => {
    window.location.href = "/login.html";
  });
}

if (backToRegisterBtn) {
  backToRegisterBtn.addEventListener("click", () => {
    window.location.href = "/register.html";
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      console.log("Logout button clicked");
      const confirmLogout = confirm("Are you sure you want to log out?");
      if (!confirmLogout) {
        return;
      }
      const result = await logOut();
      alert(result.message || "Logout successful");
      stateManage.logOut();
    } catch (error) {
      alert(error.message || "Logout failed");
    }
  });
}

if (usersTabBtn) {
  usersTabBtn.addEventListener("click", () => loadUsersTab());
}

if (artistsTabBtn) {
  artistsTabBtn.addEventListener("click", () => loadArtistsTab());
}

if (tabContent) {
  initializeDashboardByRole();
}
