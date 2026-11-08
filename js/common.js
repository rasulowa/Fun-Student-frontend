const STORAGE_USERS = "funStudentUsers";
const STORAGE_SESSION = "funStudentSession";

function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_USERS)) || []; }
  catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}
function getSession() {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_SESSION) || localStorage.getItem(STORAGE_SESSION)); }
  catch { return null; }
}
function saveSession(user) {
  sessionStorage.setItem(STORAGE_SESSION, JSON.stringify({ id: user.id }));
}
function clearSession() {
  sessionStorage.removeItem(STORAGE_SESSION);
  localStorage.removeItem(STORAGE_SESSION);
}
function currentUser() {
  const session = getSession();
  return session ? getUsers().find(user => user.id === session.id) || null : null;
}
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function makeId() {
  return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + Math.random());
}
function seedUsers() {
  if (localStorage.getItem(STORAGE_USERS)) return;
  const today = new Date().toISOString();
  const demo = [
    { id: "demo-admin", fullName: "Администратор Системы", email: "admin@funstudent.ru", password: "Admin123!", role: "Администратор", createdAt: today },
    { id: "demo-student", fullName: "Анна Смирнова", email: "anna@example.com", password: "Student123!", role: "Студент", createdAt: today },
    { id: "demo-teacher", fullName: "Михаил Петров", email: "petrov@example.com", password: "Teacher123!", role: "Преподаватель", createdAt: today },
    { id: "demo-student2", fullName: "Елена Иванова", email: "elena@example.com", password: "Student123!", role: "Студент", createdAt: today }
  ];
  saveUsers(demo);
}
function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("ru-RU");
}
function initials(name) {
  return name.trim().split(/\s+/).slice(0,2).map(part => part[0] || "").join("").toUpperCase();
}
document.addEventListener("DOMContentLoaded", () => {
  seedUsers();
  document.querySelectorAll("[data-toggle-password]").forEach(button => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.togglePassword);
      if (!input) return;
      const isVisible = input.type === "password";
      input.type = isVisible ? "text" : "password";
      button.setAttribute("aria-label", isVisible ? "Скрыть пароль" : "Показать пароль");
      button.setAttribute("title", isVisible ? "Скрыть пароль" : "Показать пароль");
      button.innerHTML = isVisible
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10 10 0 0 0 3.2-.5"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
    });
  });
});
