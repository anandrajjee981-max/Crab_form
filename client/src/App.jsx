import { createBrowserRouter } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Builder from './pages/Builder'
import CreateForm from './pages/CreateForm'
import Login from './pages/Login'
import Register from './pages/Register'
import PublicForm from './pages/PublicForm'
import MySubmissions from './pages/MySubmissions'

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/create', element: <CreateForm /> },
  { path: '/builder/:id', element: <Builder /> },
  { path: '/f/:slug', element: <PublicForm /> },
  { path: '/public/:slug', element: <PublicForm /> },
  { path: '/s/:slug', element: <PublicForm /> },
  { path: '/form/:slug', element: <PublicForm /> },
  // Separate getMyFormData UI - respondent's own submissions
  { path: '/my-submissions', element: <MySubmissions /> },
  { path: '/my-responses', element: <MySubmissions /> },
  { path: '/my-form-data', element: <MySubmissions /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
])
