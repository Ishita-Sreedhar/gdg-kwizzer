import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import AppRoutes from './routes'
import './index.css'

const container =
	document.getElementById('root') ||
	(() => {
		const el = document.createElement('div')
		el.id = 'root'
		document.body.appendChild(el)
		return el
	})()

createRoot(container).render(
	<React.StrictMode>
		<BrowserRouter>
			<AppRoutes />
		</BrowserRouter>
	</React.StrictMode>
)
