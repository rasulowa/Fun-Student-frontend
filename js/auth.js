document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (currentUser() && (loginForm || registerForm)) {
    window.location.href = "users.html";
    return;
  }

  if (loginForm) {
    loginForm.addEventListener("submit", event => {
      event.preventDefault();
      const email = document.getElementById("loginEmail").value.trim().toLowerCase();
      const password = document.getElementById("loginPassword").value;
      const error = document.getElementById("loginError");
      const user = getUsers().find(item => item.email.toLowerCase() === email && item.password === password);
      if (!user) {
        error.textContent = "Неверная электронная почта или пароль.";
        return;
      }
      error.textContent = "";
      saveSession(user);
      window.location.href = "users.html";
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", event => {
      event.preventDefault();
      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const email = document.getElementById("registerEmail").value.trim().toLowerCase();
      const password = document.getElementById("registerPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const role = registerForm.querySelector('input[name="role"]:checked').value;
      const error = document.getElementById("registerError");
      error.textContent = "";

      if (password.length < 6) { error.textContent = "Пароль должен содержать не менее 6 символов."; return; }
      if (password !== confirmPassword) { error.textContent = "Пароли не совпадают."; return; }
      const users = getUsers();
      if (users.some(user => user.email.toLowerCase() === email)) { error.textContent = "Пользователь с такой почтой уже существует."; return; }

      const user = {
        id: makeId(), fullName: `${firstName} ${lastName}`, email,
        password, role, createdAt: new Date().toISOString()
      };
      users.push(user);
      saveUsers(users);
      saveSession(user);
      window.location.href = "users.html";
    });
  }
});
