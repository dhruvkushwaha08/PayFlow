const TOKEN_KEY = "payflow_token";
const USER_KEY = "payflow_user";

export function saveAuthData(data) {
  localStorage.setItem(TOKEN_KEY, data.token);

  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      username: data.username,
      role: data.role,
    })
  );
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const user = localStorage.getItem(USER_KEY);

  return user ? JSON.parse(user) : null;
}

export function isLoggedIn() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}