document.addEventListener("DOMContentLoaded", () => {
  let signedInUser = currentUser();
  if (!signedInUser) { window.location.href = "login.html"; return; }

  const tableBody = document.getElementById("usersTableBody");
  const modal = document.getElementById("userModal");
  const form = document.getElementById("userForm");
  const error = document.getElementById("userFormError");
  const isAdmin = signedInUser.role === "Администратор";

  document.getElementById("currentUserName").textContent = signedInUser.fullName;
  document.getElementById("currentUserRole").textContent = signedInUser.role;
  document.getElementById("userAvatar").textContent = initials(signedInUser.fullName);

  if (!isAdmin) {
    document.getElementById("addUserButton").hidden = true;
  }

  function render() {
    const allUsers = getUsers();
    const search = document.getElementById("searchInput").value.trim().toLowerCase();
    const role = document.getElementById("roleFilter").value;
    const filtered = allUsers.filter(user => {
      const matchesSearch = `${user.fullName} ${user.email}`.toLowerCase().includes(search);
      return matchesSearch && (!role || user.role === role);
    });
    document.getElementById("totalCount").textContent = allUsers.length;
    document.getElementById("studentCount").textContent = allUsers.filter(u => u.role === "Студент").length;
    document.getElementById("teacherCount").textContent = allUsers.filter(u => u.role === "Преподаватель").length;
    document.getElementById("adminCount").textContent = allUsers.filter(u => u.role === "Администратор").length;
    document.getElementById("resultsCount").textContent = `Показано ${filtered.length} из ${allUsers.length} пользователей`;

    if (!filtered.length) {
      tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">Пользователи не найдены</td></tr>';
      return;
    }
    tableBody.innerHTML = filtered.map((user, index) => {
      const roleClass = user.role === "Преподаватель" ? "teacher" : user.role === "Администратор" ? "admin" : "";
      const actions = isAdmin
        ? `<div class="actions"><button class="action-btn" data-edit="${escapeHtml(user.id)}">Изменить</button><button class="action-btn delete" data-delete="${escapeHtml(user.id)}">Удалить</button></div>`
        : '<span class="muted">Нет доступа</span>';
      return `<tr>
        <td>${index + 1}</td>
        <td><div class="user-cell"><span class="user-avatar">${escapeHtml(initials(user.fullName))}</span>${escapeHtml(user.fullName)}</div></td>
        <td>${escapeHtml(user.email)}</td>
        <td><span class="role-badge ${roleClass}">${escapeHtml(user.role)}</span></td>
        <td>${formatDate(user.createdAt)}</td>
        <td>${actions}</td>
      </tr>`;
    }).join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  const confirmModal = document.getElementById("confirmModal");
  let confirmAction = null;
  function askConfirmation(title, message, action, buttonLabel) {
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmMessage").textContent = message;
    document.getElementById("confirmAccept").textContent = buttonLabel;
    confirmAction = action;
    confirmModal.hidden = false;
  }
  function closeConfirmation() { confirmModal.hidden = true; confirmAction = null; }
  document.getElementById("confirmCancel").addEventListener("click", closeConfirmation);
  confirmModal.addEventListener("click", event => { if (event.target === confirmModal) closeConfirmation(); });
  document.getElementById("confirmAccept").addEventListener("click", () => {
    const action = confirmAction; closeConfirmation(); if (action) action();
  });

  function openModal(user = null) {
    if (!isAdmin) return;
    form.reset();
    error.textContent = "";
    document.getElementById("editingId").value = user ? user.id : "";
    document.getElementById("modalTitle").textContent = user ? "Изменить пользователя" : "Добавить пользователя";
    document.getElementById("userFullName").value = user ? user.fullName : "";
    document.getElementById("userEmail").value = user ? user.email : "";
    document.getElementById("userRole").value = user ? user.role : "Студент";
    modal.hidden = false;
    document.getElementById("userFullName").focus();
  }
  function closeModal() { modal.hidden = true; }

  document.getElementById("addUserButton").addEventListener("click", () => openModal());
  document.getElementById("closeModal").addEventListener("click", closeModal);
  document.getElementById("cancelModal").addEventListener("click", closeModal);
  modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") { closeModal(); closeConfirmation(); } });

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!isAdmin) return;
    const id = document.getElementById("editingId").value;
    const fullName = document.getElementById("userFullName").value.trim();
    const email = document.getElementById("userEmail").value.trim().toLowerCase();
    const role = document.getElementById("userRole").value;
    const users = getUsers();
    if (users.some(user => user.email.toLowerCase() === email && user.id !== id)) {
      error.textContent = "Пользователь с такой почтой уже существует.";
      return;
    }
    if (id) {
      const index = users.findIndex(user => user.id === id);
      if (index < 0) return;
      users[index] = { ...users[index], fullName, email, role };
      showToast("Данные пользователя обновлены.");
    } else {
      users.push({ id: makeId(), fullName, email, role, password: "ChangeMe123!", createdAt: new Date().toISOString() });
      showToast("Пользователь добавлен. Временный пароль: ChangeMe123!");
    }
    saveUsers(users);
    closeModal();
    render();
  });

  tableBody.addEventListener("click", event => {
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");
    if (editButton && isAdmin) {
      const user = getUsers().find(item => item.id === editButton.dataset.edit);
      if (user) openModal(user);
    }
    if (deleteButton && isAdmin) {
      const id = deleteButton.dataset.delete;
      if (id === signedInUser.id) { showToast("Нельзя удалить собственную учетную запись во время сессии."); return; }
      const user = getUsers().find(item => item.id === id);
      if (!user) return;
      askConfirmation("Удалить пользователя?", `Учетная запись «${user.fullName}» будет удалена. Это действие нельзя отменить.`, () => {
        saveUsers(getUsers().filter(item => item.id !== id));
        showToast("Пользователь удален."); render();
      }, "Удалить");
    }
  });

  document.getElementById("searchInput").addEventListener("input", render);
  document.getElementById("roleFilter").addEventListener("change", render);
  document.getElementById("refreshButton").addEventListener("click", () => { render(); showToast("Список обновлен."); });
  document.getElementById("logoutButton").addEventListener("click", () => {
    askConfirmation("Выйти из аккаунта?", "Вы действительно хотите завершить текущий сеанс?", () => {
      clearSession(); window.location.href = "login.html";
    }, "Выйти");
  });
  document.getElementById("mobileMenu").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));

  render();
});
