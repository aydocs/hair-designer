import { renderHeader, initMobileMenu } from '../components/Header';
import { renderFooter } from '../components/Footer';
import { getServices } from '../services/api';

export const renderServicesPage = async (app: HTMLElement, router: any) => {
    app.innerHTML = `
        <div class="min-h-screen flex flex-col bg-black text-white">
            ${renderHeader()}
            <main class="flex-grow pt-10 pb-20">
                <div class="container mx-auto px-4">
                    <h1 class="text-4xl md:text-5xl font-serif font-bold text-center mb-4 text-white">Hizmetlerimiz</h1>
                    <p class="text-center text-brand-gray-400 mb-12 max-w-2xl mx-auto">Size özel saç tasarım ve bakım hizmetlerimizle tanışın.</p>
                    
                    <div id="services-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div class="col-span-full text-center text-brand-gray-500 py-20">
                            <i class="fas fa-spinner fa-spin text-3xl mb-4"></i><br>Hizmetler yükleniyor...
                        </div>
                    </div>

                    <div class="text-center mt-16">
                        <a href="/booking" class="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-brand-gray-200 transition-all inline-block" data-navigo>
                            Hemen Randevu Al
                        </a>
                    </div>
                </div>
            </main>
            
            ${renderFooter()}
        </div>
    `;

    // Initialize Mobile Menu
    initMobileMenu();

    // Load Services content
    const servicesList = document.getElementById('services-list');
    if (servicesList) {
        try {
            const services = await getServices();
            const getIcon = (name: string) => {
                if (name.includes('Saç')) return 'fa-scissors';
                if (name.includes('Sakal')) return 'fa-user-clock';
                if (name.includes('Bakım')) return 'fa-spa';
                if (name.includes('Fön')) return 'fa-wind';
                return 'fa-star';
            };

            servicesList.innerHTML = services.map(s => `
                <div class="bg-gradient-to-br from-brand-gray-900 to-black p-8 rounded-2xl shadow-lg border border-brand-gray-800 group hover:border-brand-gray-600 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
                    <div class="mb-6 w-16 h-16 bg-brand-gray-800 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors duration-300">
                        <i class="fas ${getIcon(s.name)} text-2xl text-white group-hover:text-black"></i>
                    </div>
                    <h3 class="text-2xl font-bold mb-3 text-white font-serif tracking-wide">${s.name}</h3>
                    <p class="text-brand-gray-400 text-sm mb-6 flex-grow">Profesyonel dokunuşlarla tarzınızı yenileyin.</p>
                    <div class="flex justify-between items-end mt-auto pt-6 border-t border-brand-gray-800">
                        <span class="text-brand-gray-400 text-sm flex items-center bg-brand-gray-900 px-3 py-1 rounded-full"><i class="far fa-clock mr-2"></i> ${s.duration} Dk</span>
                        <span class="text-white font-bold text-2xl">${s.price} TL</span>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.error(err);
            servicesList.innerHTML = `<div class="col-span-full text-center text-red-500 bg-red-500/10 p-10 rounded-xl border border-red-500/20"><i class="fas fa-exclamation-circle text-2xl mb-2"></i><br>Hizmetler yüklenemedi. Lütfen bağlantınızı kontrol edin.</div>`;
        }
    }
};
