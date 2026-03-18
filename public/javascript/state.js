const stateManage = {
  _state: {
    user: JSON.parse(localStorage.getItem("currentUser")) || null,
  },

  normalizeUser(userData) {
    if (!userData) return null;
    return userData.user ? userData.user : userData;
  },

  getUser() {
    return this._state.user;
  },

  setLogin(userData) {
    const normalizedUser = this.normalizeUser(userData);

    this._state.user = normalizedUser;
    localStorage.setItem("currentUser", JSON.stringify(normalizedUser));
    this.render();
  },

  logOut() {
    this._state.user = null;
    localStorage.removeItem("currentUser");
    window.location.href = "/login.html";
  },

  render() {
    const user = this.getUser();
    const userInfoDiv = document.getElementById("user-info");
    if (userInfoDiv) {
      if (user) {
        const firstName = user.first_name || user.firstName || "";
        const lastName = user.last_name || user.lastName || "";
        const displayName =
          `${firstName} ${lastName}`.trim() || user.email || "User";
        userInfoDiv.textContent = `Logged in as: ${displayName} (${user.role || "unknown"})`;
      } else {
        userInfoDiv.textContent = "Not logged in";
      }
    }
  },
};

window.stateManage = stateManage;
