import { renderHeader, initMobileMenu } from '../components/Header';
import { renderBookingWizard } from '../components/BookingWizard';
import { renderFooter } from '../components/Footer';

export const renderBookingPage = (app: HTMLElement, router: any) => {
    app.innerHTML = `
        <div class="min-h-screen flex flex-col bg-brand-black">
            ${renderHeader()}
            <main class="flex-grow pt-10 pb-20">
                <div class="container mx-auto px-4">
                    <h1 class="text-3xl md:text-5xl font-serif font-bold text-center mb-8 text-white">Randevu Al</h1>
                    
                    <!-- Booking Wizard Container -->
                    <div id="booking-wizard-page-container"></div>
                </div>
            </main>
            
            ${renderFooter()}
        </div>
    `;

    // Initialize Mobile Menu
    initMobileMenu();

    // Initialize Booking Wizard
    const wizardContainer = document.getElementById('booking-wizard-page-container');
    if (wizardContainer) {
        renderBookingWizard(wizardContainer);
    }
};
