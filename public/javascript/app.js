const backToLoginBtn = document.getElementById("back-to-login");
const backToRegisterBtn = document.getElementById("back-to-register");
const logInForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const logOutBtn = document.getElementById("logout-button");
const usersTabBtn = document.getElementById("tab-users");
const artistsTabBtn = document.getElementById("tab-artists");
const tabContent = document.getElementById("tab-content");
const dashboardTitle = document.getElementById("dashboard-title");

let currentTableEntity = null;
const tableDataStore = {
  users: [],
  artists: [],
  songs: [],
};
const paginationState = {
  users: { page: 1, limit: 10, totalRecords: 0, totalPages: 1 },
  artists: { page: 1, limit: 10, totalRecords: 0, totalPages: 1 },
  songs: { page: 1, limit: 10, totalRecords: 0, totalPages: 1 },
};

function getCreateButtonConfig(role, entity) {
  if (role === "super_admin" && entity === "users") {
    return { entity: "users", label: "Create Artist Manager" };
  }

  if (role === "artist_manager" && entity === "artists") {
    return { entity: "artists", label: "Create Artist" };
  }

  if (role === "artist" && entity === "songs") {
    return { entity: "songs", label: "Create Song" };
  }

  return null;
}

function renderCreateButton(entity, role) {
  const config = getCreateButtonConfig(role, entity);
  if (!config || !tabContent) {
    return;
  }

  tabContent.insertAdjacentHTML(
    "beforeend",
    `
      <div class="table-toolbar">
        <button type="button" class="open-create-modal-btn" data-entity="${config.entity}">${config.label}</button>
      </div>
    `,
  );
}

function getCreateModalFields(entity) {
  if (entity === "users") {
    return `
      <label for="create-first-name">First Name</label>
      <input id="create-first-name" name="firstName" type="text" required />

      <label for="create-last-name">Last Name</label>
      <input id="create-last-name" name="lastName" type="text" required />
      <label for="create-dob">Date of Birth</label>
      <input id="create-dob" name="dob" type="date" required />
      <label for="create-email">Email</label>
      <input id="create-email" name="email" type="email" required />
      <label for="create-password">Password</label>
      <input id="create-password" name="password" type="password" required />
      <label for="create-phone">Phone</label>
      <input id="create-phone" name="phone" type="tel" />
      <label for="create-gender">Gender</label>
      <select id="create-gender" name="gender">
        <option value="">Select gender</option>
        <option value="male">male</option>
        <option value="female">female</option>
        <option value="other">other</option>
      </select>

      <label for="create-address">Address</label>
      <input id="create-address" name="address" type="text" />
    `;
  }

  if (entity === "artists") {
    return `
      <label for="create-first-name">First Name</label>
      <input id="create-first-name" name="firstName" type="text" required />

      <label for="create-last-name">Last Name</label>
      <input id="create-last-name" name="lastName" type="text" required />

      <label for="create-dob">Date of Birth</label>
      <input id="create-dob" name="dob" type="date" required />

      <label for="create-email">Email</label>
      <input id="create-email" name="email" type="email" required />

      <label for="create-password">Password</label>
      <input id="create-password" name="password" type="password" required />

      <label for="create-phone">Phone</label>
      <input id="create-phone" name="phone" type="tel" placeholder="98XXXXXXXX" />

      <label for="create-gender">Gender</label>
      <select id="create-gender" name="gender" required>
        <option value="male">male</option>
        <option value="female">female</option>
        <option value="other">other</option>
      </select>

      <label for="create-address">Address</label>
      <input id="create-address" name="address" type="text" required />

      <label for="create-first-release-year">First Release Year</label>
      <input id="create-first-release-year" name="firstReleaseYear" type="number" />

      <label for="create-no-albums">No. of Albums Released</label>
      <input id="create-no-albums" name="noOfAlbumsReleased" type="number" />
    `;
  }

  if (entity === "songs") {
    return `
      <label for="create-title">Title</label>
      <input id="create-title" name="title" type="text" required />
      
      <label for="create-album">Album</label>
      <input id="create-album" name="albumName" type="text" />

      <label for="create-genre">Genre</label>
       <select id="create-genre" name="genre" required>
        <option value="rnb">rnb</option>
        <option value="country">country</option>
        <option value="classic">classic</option>
        <option value="rock">rock</option>
        <option value="jazz">jazz</option>
      </select>
      

    `;
  }

  return "";
}

function openFormModal({ title, fieldsHtml, submitText, onSubmit }) {
  closeEditModal();

  const modal = document.createElement("div");
  modal.id = "edit-modal-overlay";
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
      <h1 id="edit-modal-title">${title}</h1>
      <form id="edit-modal-form" class="inline-form">
        ${fieldsHtml}
        <div class="modal-actions">
          <button type="button" id="cancel-edit-btn">Cancel</button>
          <button type="submit">${submitText}</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector("#cancel-edit-btn")?.addEventListener("click", () => {
    closeEditModal();
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeEditModal();
    }
  });

  const form = modal.querySelector("#edit-modal-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      await onSubmit(payload);
      closeEditModal();
    } catch (error) {
      alert(error.message || "Action failed");
    }
  });
}

function renderPaginationControls(entity) {
  const state = paginationState[entity];
  if (!state) {
    return "";
  }

  const { page, limit, totalRecords, totalPages } = state;
  const isPrevDisabled = page <= 1;
  const isNextDisabled = totalRecords <= page * limit || page >= totalPages;

  return `
    <div class="pagination-controls" data-entity="${entity}">
      <button type="button" class="pagination-btn" data-action="prev" data-entity="${entity}" ${isPrevDisabled ? "disabled" : ""}>Prev</button>
      <span class="pagination-info">Page ${page} of ${totalPages} (${totalRecords} total)</span>
      <button type="button" class="pagination-btn" data-action="next" data-entity="${entity}" ${isNextDisabled ? "disabled" : ""}>Next</button>
    </div>
  `;
}

function renderRows(title, rows, columns, entity) {
  if (!tabContent) {
    return;
  }

  if (!rows || rows.length === 0) {
    tabContent.innerHTML = `<h2>${title}</h2><p>No records found.</p>`;
    return;
  }

  // render headers of the table
  const headerRow = columns
    .map((column) => `<th>${column.label}</th>`)
    .join("");

  //render body of the table
  const bodyRows = rows
    .map((row) => {
      const cells = columns
        .map((column) => {
          if (column.key === "operations") {
            return `
              <td>
                <div class="table-actions" data-row-id="${row.id}">
                  <button type="button" class="action-btn update-btn" data-action="update" data-id="${row.id}">Update</button>
                  <button type="button" class="action-btn delete-btn" data-action="delete" data-id="${row.id}">Delete</button>
                </div>
              </td>
            `;
          }

          return `<td>${row[column.key] ?? ""}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  tabContent.innerHTML = `
        <h2>${title}</h2>
      <div class="table-scroll">
        <table class="data-table" data-entity="${entity || ""}">
          <thead>
            <tr>${headerRow}</tr>
          </thead>
          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </div>
      ${entity ? renderPaginationControls(entity) : ""}
    `;
}

function getClientPaginatedRows(entity, rows) {
  const state = paginationState[entity];
  const startIndex = (state.page - 1) * state.limit;
  const endIndex = startIndex + state.limit;
  return rows.slice(startIndex, endIndex);
}

function setClientPaginationMeta(entity, totalRecords) {
  const state = paginationState[entity];
  state.totalRecords = totalRecords;
  state.totalPages = Math.max(1, Math.ceil(totalRecords / state.limit));
  if (state.page > state.totalPages) {
    state.page = state.totalPages;
  }
}

function setServerPaginationMeta(entity, pagination) {
  const state = paginationState[entity];

  const resolvedPage = Number(
    pagination?.currentPage ?? pagination?.page ?? state.page ?? 1,
  );
  const resolvedLimit = Number(pagination?.limit ?? state.limit ?? 10);
  const resolvedTotalRecords = Number(
    pagination?.totalRecords ?? pagination?.total ?? 0,
  );
  const resolvedTotalPages = Number(
    pagination?.totalPages ??
      Math.max(1, Math.ceil(resolvedTotalRecords / resolvedLimit)),
  );

  state.page = resolvedPage;
  state.limit = resolvedLimit;
  state.totalRecords = resolvedTotalRecords;
  state.totalPages = resolvedTotalPages;

  if (state.page > state.totalPages) {
    state.page = state.totalPages;
  }

  if (state.page < 1) {
    state.page = 1;
  }
}

async function handlePaginationAction(entity, action) {
  const state = paginationState[entity];
  if (!state) return;

  if (action === "prev" && state.page > 1) {
    state.page -= 1;
  }

  if (action === "next" && state.page < state.totalPages) {
    state.page += 1;
  }

  if (entity === "users") {
    await loadUsersTab(resolveCurrentRole());
  }

  if (entity === "artists") {
    await loadArtistsTab(resolveCurrentRole());
  }

  if (entity === "songs") {
    await loadSongsTab();
  }
}

function getRowByEntityAndId(entity, rowId) {
  const rows = tableDataStore[entity] || [];
  return rows.find((row) => String(row.id) === String(rowId));
}

function getModalFields(entity, row) {
  if (entity === "users") {
    return `
      <label for="edit-first-name">First Name</label>
      <input id="edit-first-name" name="firstName" type="text" value="${row.first_name || ""}" required />

      <label for="edit-last-name">Last Name</label>
      <input id="edit-last-name" name="lastName" type="text" value="${row.last_name || ""}" required />

      <label for="edit-email">Email</label>
      <input id="edit-email" name="email" type="email" value="${row.email || ""}" required />

      <label for="edit-dob">Date of Birth</label>
      <input id="edit-dob" name="dob" type="date" value="${row.dob || ""}" />

      <label for="edit-phone">Phone</label>
      <input id="edit-phone" name="phone" type="text" value="${row.phone || ""}" />
      <label for ="edit-gender">Gender</label>
      <select id="edit-gender" name="gender" required>
        <option value="male" ${row.gender === "m" ? "selected" : ""}>male</option>
        <option value="female" ${row.gender === "f" ? "selected" : ""}>female</option>
        <option value="other" ${row.gender === "o" ? "selected" : ""}>other</option>
      </select>

      <label for="edit-address">Address</label>
      <input id="edit-address" name="address" type="text" value="${row.address || ""}" />

      <label for="edit-role">Role</label>
      <select id="edit-role" name="role" required>
        <option value="super_admin" ${row.role === "super_admin" ? "selected" : ""}>super_admin</option>
        <option value="artist_manager" ${row.role === "artist_manager" ? "selected" : ""}>artist_manager</option>
        <option value="artist" ${row.role === "artist" ? "selected" : ""}>artist</option>
      </select>
    `;
  }

  if (entity === "artists") {
    return `
      <label for="edit-name">Name</label>
      <input id="edit-name" name="name" type="text" value="${row.name || ""}" required />

      <label for="edit-dob">Date of Birth</label>
      <input id="edit-dob" name="dob" type="date" value="${row.dob || ""}" />

      <label for="edit-gender">Gender</label>
      <select id="edit-gender" name="gender" required>
        <option value="male" ${row.gender === "m" || row.gender === "male" ? "selected" : ""}>male</option>
        <option value="female" ${row.gender === "f" || row.gender === "female" ? "selected" : ""}>female</option>
        <option value="other" ${row.gender === "o" || row.gender === "other" ? "selected" : ""}>other</option>
      </select>

      <label for="edit-address">Address</label>
      <input id="edit-address" name="address" type="text" value="${row.address || ""}" />

      <label for="edit-first-release-year">First Release Year</label>
      <input id="edit-first-release-year" name="firstReleaseYear" type="number" value="${row.first_release_year || ""}" />

      <label for="edit-no-albums">No. of Albums Released</label>
      <input id="edit-no-albums" name="noOfAlbumsReleased" type="number" value="${row.no_of_albums_released || ""}" />
    `;
  }

  if (entity === "songs") {
    return `
      <label for="edit-title">Title</label>
      <input id="edit-title" name="title" type="text" value="${row.title || ""}" required />

      <label for="edit-album-name">Album</label>
      <input id="edit-album-name" name="albumName" type="text" value="${row.album_name || ""}" />

      <label for="edit-genre">Genre</label>
      <input id="edit-genre" name="genre" type="text" value="${row.genre || ""}" required />

      <label for="edit-artist-id">Artist ID</label>
      <input id="edit-artist-id" name="artistId" type="number" value="${row.artist_id || ""}" />
    `;
  }

  return "";
}

function closeEditModal() {
  const existingModal = document.getElementById("edit-modal-overlay");
  if (existingModal) {
    existingModal.remove();
  }
}

function openEditModal(entity, rowId) {
  const row = getRowByEntityAndId(entity, rowId);
  if (!row) {
    alert("Unable to find selected row data.");
    return;
  }

  const fieldsHtml = getModalFields(entity, row);
  if (!fieldsHtml) {
    alert("No update form available for this table.");
    return;
  }

  openFormModal({
    title: `Update ${entity.slice(0, -1)}`,
    fieldsHtml,
    submitText: "Save",
    onSubmit: async (payload) => {
      if (entity === "users") {
        await updateUser(rowId, payload);
        alert("User updated successfully");
        await loadUsersTab(resolveCurrentRole());
      }

      if (entity === "artists") {
        await updateArtist(rowId, payload);
        alert("Artist updated successfully");
        await loadArtistsTab(resolveCurrentRole());
      }

      if (entity === "songs") {
        await updateSong(rowId, payload);
        alert("Song updated successfully");
        await loadSongsTab();
      }
    },
  });
}

function openCreateModal(entity) {
  const fieldsHtml = getCreateModalFields(entity);
  if (!fieldsHtml) {
    return;
  }

  openFormModal({
    title: `Create ${entity.slice(0, -1)}`,
    fieldsHtml,
    submitText: "Create",
    onSubmit: async (payload) => {
      if (entity === "users") {
        await createArtistManager(payload);
        alert("Artist manager created successfully");
        await loadUsersTab(resolveCurrentRole());
      }

      if (entity === "artists") {
        await createArtist(payload);
        alert("Artist created successfully");
        await loadArtistsTab(resolveCurrentRole());
      }

      if (entity === "songs") {
        await createSong(payload);
        alert("Song created successfully");
        await loadSongsTab();
      }
    },
  });
}

async function handleUpdateAction(entity, rowId) {
  openEditModal(entity, rowId);
}

async function handleDeleteAction(entity, rowId) {
  const confirmDelete = confirm("Are you sure you want to delete this record?");
  if (!confirmDelete) {
    return;
  }

  if (entity === "users") {
    await deleteUser(rowId);
    alert("User deleted successfully");
    await loadUsersTab(resolveCurrentRole());
    return;
  }

  if (entity === "artists") {
    await deleteArtist(rowId);
    alert("Artist deleted successfully");
    await loadArtistsTab(resolveCurrentRole());
    return;
  }

  if (entity === "songs") {
    await deleteSong(rowId);
    alert("Song deleted successfully");
    await loadSongsTab();
  }
}

async function handleTableActionClick(event) {
  const createButton = event.target.closest(".open-create-modal-btn");
  if (createButton) {
    const entity = createButton.dataset.entity;
    openCreateModal(entity);
    return;
  }

  const paginationButton = event.target.closest(".pagination-btn");
  if (paginationButton) {
    const action = paginationButton.dataset.action;
    const entity = paginationButton.dataset.entity;
    await handlePaginationAction(entity, action);
    return;
  }

  const button = event.target.closest(".action-btn");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const rowId = button.dataset.id;
  const table = button.closest("table");
  const entity = table?.dataset.entity || currentTableEntity;

  console.log("Action button clicked:", { action, rowId, entity });

  if (!action || !rowId || !entity) {
    return;
  }

  try {
    if (action === "update") {
      await handleUpdateAction(entity, rowId);
    }

    if (action === "delete") {
      await handleDeleteAction(entity, rowId);
    }
  } catch (error) {
    alert(error.message || "Action failed");
  }
}

function resolveCurrentRole(role) {
  if (typeof role === "string" && role.length > 0) {
    return role;
  }

  return stateManage.getUser()?.role;
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
    loadSongsTab();
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

    const data = await getUsers({
      page: paginationState.users.page,
      limit: paginationState.users.limit,
    });
    console.log("Fetched users data:", data);
    const rows = data.users || [];
    setServerPaginationMeta("users", data.pagination);
    tableDataStore.users = rows;
    currentTableEntity = "users";
    renderRows(
      "Users",
      rows,
      [
        { key: "id", label: "ID" },
        { key: "first_name", label: "First Name" },
        { key: "last_name", label: "Last Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "dob", label: "Date of Birth" },
        { key: "gender", label: "Gender" },
        { key: "address", label: "Address" },
        { key: "role", label: "Role" },
        { key: "operations", label: "Operations" },
      ],
      "users",
    );
    renderCreateButton("users", currentRole);
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

    const data = await getArtists({
      page: paginationState.artists.page,
      limit: paginationState.artists.limit,
    });
    tableDataStore.artists = data.artists || [];
    setClientPaginationMeta("artists", tableDataStore.artists.length);
    const paginatedArtists = getClientPaginatedRows(
      "artists",
      tableDataStore.artists,
    );
    currentTableEntity = "artists";
    renderRows(
      "Artists",
      paginatedArtists,
      [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "gender", label: "Gender" },
        { key: "address", label: "Address" },
        { key: "first_release_year", label: "First Release Year" },
        { key: "no_of_albums_released", label: "Albums Released" },
        { key: "operations", label: "Operations" },
      ],
      "artists",
    );
    renderCreateButton("artists", currentRole);
  } catch (error) {
    tabContent.innerHTML = `<p>Failed to load artists: ${error.message}</p>`;
  }
}

async function loadSongsTab() {
  if (!tabContent) {
    return;
  }

  tabContent.innerHTML = "<p>Loading songs...</p>";

  try {
    const data = await getSongs();
    tableDataStore.songs = data.songs || [];
    setClientPaginationMeta("songs", tableDataStore.songs.length);
    const paginatedSongs = getClientPaginatedRows(
      "songs",
      tableDataStore.songs,
    );
    currentTableEntity = "songs";
    renderRows(
      "Songs",
      paginatedSongs,
      [
        { key: "id", label: "ID" },
        { key: "title", label: "Title" },
        { key: "album_name", label: "Album" },
        { key: "genre", label: "Genre" },
        { key: "artist_id", label: "Artist ID" },
        { key: "operations", label: "Operations" },
      ],
      "songs",
    );
    renderCreateButton("songs", resolveCurrentRole());
  } catch (error) {
    tabContent.innerHTML = `<p>Failed to load songs: ${error.message}</p>`;
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
    const phone = document.getElementById("phone").value.trim();
    const dob = document.getElementById("date-of-birth").value;
    const gender = document.getElementById("gender").value;
    const address = document.getElementById("address").value.trim();

    const payload = {
      firstName,
      lastName,
      email,
      password,
      phone,
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
  usersTabBtn.addEventListener("click", () => {
    paginationState.users.page = 1;
    loadUsersTab();
  });
}

if (artistsTabBtn) {
  artistsTabBtn.addEventListener("click", () => {
    paginationState.artists.page = 1;
    loadArtistsTab();
  });
}

if (tabContent) {
  tabContent.addEventListener("click", handleTableActionClick);
  initializeDashboardByRole();
}
