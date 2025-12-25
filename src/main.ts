import './style.css'
import Navigo from 'navigo';
import { renderHome } from './pages/Home';
import { renderLoginPage } from './pages/Login';
import { renderDashboard } from './pages/Dashboard';
import { initDatabase } from './services/Database';

import { renderServicesPage } from './pages/ServicesPage';
import { renderContactPage } from './pages/ContactPage';
import { renderBookingPage } from './pages/BookingPage';
import { renderReviewPage } from './pages/ReviewPage';
import { renderAllReviewsPage } from './pages/AllReviewsPage';

import { renderAdminQRPage } from './pages/AdminQRPage';

// Initialize Mock Database
initDatabase();

const router = new Navigo('/', { hash: true });

const app = document.querySelector<HTMLDivElement>('#app')!;
console.log('App Version: 2025-12-25-FIX-URL-HARDCODED'); // Cache Buster

router
    .on('/', () => {
        app.innerHTML = '';
        renderHome(app, router);
    })
    .on('/services', () => {
        app.innerHTML = '';
        renderServicesPage(app, router);
    })
    .on('/contact', () => {
        app.innerHTML = '';
        renderContactPage(app, router);
    })
    .on('/booking', () => {
        app.innerHTML = '';
        renderBookingPage(app, router);
    })
    .on('/review', () => {
        app.innerHTML = '';
        renderReviewPage(app, router);
    })
    .on('/reviews', () => {
        app.innerHTML = '';
        renderAllReviewsPage(app, router);
    })
    .on('/login', () => {
        app.innerHTML = '';
        renderLoginPage(app, router);
    })
    .on('/dashboard', () => {
        app.innerHTML = '';
        renderDashboard(app, router);
    })
    .on('/admin-qr', () => {
        app.innerHTML = '';
        renderAdminQRPage(app, router);
    })
    .resolve();
