# 📡 API & Route Reference

Doable uses Inertia.js for single-page application routing. Server routes return rendered Inertia pages or JSON responses.

---

## 🔐 Auth & Account Routes

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/login` | Render login view | No |
| `POST` | `/login` | Authenticate user session | No |
| `GET` | `/register` | Render account registration view | No |
| `POST` | `/register` | Create user account | No |
| `POST` | `/logout` | Destroy user session | Yes |

---

## 📋 Task Routes

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Render Task Dashboard (Tasks list) | Yes |
| `POST` | `/tasks` | Create a new task | Yes |
| `PUT` | `/tasks/:id` | Update task title, bucket, priority, status | Yes |
| `DELETE` | `/tasks/:id` | Soft-delete / move task to bin | Yes |
| `POST` | `/tasks/:id/restore` | Restore soft-deleted task from bin | Yes |
| `DELETE` | `/tasks/:id/force` | Permanently delete task from database | Yes |
| `POST` | `/tasks/reorder` | Update task positions after drag-and-drop | Yes |

---

## 🔥 Habit Routes

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/habits` | Render Habit Tracker view | Yes |
| `POST` | `/habits` | Create a new habit | Yes |
| `PUT` | `/habits/:id` | Edit habit details | Yes |
| `DELETE` | `/habits/:id` | Delete a habit | Yes |
| `POST` | `/habits/:id/toggle` | Toggle habit completion for a specific date | Yes |
| `POST` | `/habits/reorder` | Update habit display ordering | Yes |

---

## ⚙️ Settings & Profile Routes

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile` | Render Profile settings | Yes |
| `POST` | `/profile` | Update profile information | Yes |
| `POST` | `/profile/avatar` | Upload profile avatar picture | Yes |
| `GET` | `/security` | Render Security management tab | Yes |
| `POST` | `/profile/preferences` | Update theme mode & accent color | Yes |
| `POST` | `/profile/delete` | Delete account and associated data | Yes |

---

## 🔑 Passkey / WebAuthn Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/passkeys/register/options` | Generate WebAuthn registration options | Yes |
| `POST` | `/api/passkeys/register/verify` | Verify and store WebAuthn passkey credential | Yes |
| `POST` | `/api/passkeys/login/options` | Generate WebAuthn authentication options | No |
| `POST` | `/api/passkeys/login/verify` | Verify passkey signature and establish session | No |
