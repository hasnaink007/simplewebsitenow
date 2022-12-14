import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import './index.scss';
// import reportWebVitals from './reportWebVitals';

// Contexts
import { UserContextProvider } from 'contexts/UserContext';
import { EditorContextProvider } from 'contexts/EditorContext';
import { ProjectContextProvider } from 'contexts/ProjectContext';

// Authentication
import AuthenticatedAccess from './AuthenticatedAccess';

// Pages
import Login from 'pages/Login/Login';
import Dashboard from 'pages/Dashboard/Dashboard';
import Editor from 'pages/Editor/Editor';
import Settings from 'pages/Settings/Settings';
import NotFound from 'pages/NotFound/NotFound';
import About from './pages/About/About';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import AdminLinks from './pages/AdminLinks/AdminLinks';

ReactDOM.render(
	<Router>
		<React.StrictMode>
			<ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
			<UserContextProvider>
				<Routes>
					<Route exact path="/" element={<Login />} />
					<Route exact path="/dashboard" element={
						<AuthenticatedAccess>
							<ProjectContextProvider>
								<Dashboard />
							</ProjectContextProvider>
						</AuthenticatedAccess>
					} />
					<Route exact path="/admin_links" element={
						<AuthenticatedAccess>
							<AdminLinks />
						</AuthenticatedAccess>
					} />
					<Route exact path="/settings" element={
						<AuthenticatedAccess>
							<Settings />
						</AuthenticatedAccess>
					} />
					{<Route exact path="/editor/:id" element={
						<AuthenticatedAccess>
							<EditorContextProvider>
								<Editor />
							</EditorContextProvider>
						</AuthenticatedAccess>
					} />}
					<Route path="/reset-password" element={<ResetPassword />} />
					<Route path="/about" element={<About />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</UserContextProvider>
		</React.StrictMode>
	</Router>,
	document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
