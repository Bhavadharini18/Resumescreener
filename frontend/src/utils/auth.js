// Simple localStorage-based auth for demo purposes
const USERS_KEY = 'quickz_users'
const SESSION_KEY = 'quickz_session'

export function register({ name, email, password, role, phone, experience, company }) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  if (users.find(u => u.email === email)) throw new Error('Email already registered')
  const user = { id: Date.now().toString(), name, email, password, role, phone, experience, company }
  users.push(user)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }))
  return user
}

export function login({ email, password }) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  const user = users.find(u => u.email === email && u.password === password)
  if (!user) throw new Error('Invalid credentials')
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }))
  return user
}

export function logout() { localStorage.removeItem(SESSION_KEY) }

export function currentUser() { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') }
