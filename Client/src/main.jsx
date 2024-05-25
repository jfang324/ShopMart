import React from 'react'
import ReactDOM from 'react-dom/client'
import Admin from './routes/Admin.jsx'
import User from './routes/User.jsx'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";


const router = createBrowserRouter([
  {
    path: '/',
    element: <User />,
  },{
    path: '/Admin',
    element: <Admin />
  }]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router = {router} />
  </React.StrictMode>,
)
