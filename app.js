const API = "https://dummyjson.com/"

async function auth_login() {
   const respuesta = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'emilys',
    password: 'emilyspass',
    expiresInMins: 30, // optional, defaults to 60
  }),
  credentials: 'include' // Include cookies (e.g., accessToken) in the request
})
.then(res => res.json())
};
auth_login()
console.log(auth_login)