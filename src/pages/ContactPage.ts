import { renderHeader, initMobileMenu } from '../components/Header';
import { renderFooter } from '../components/Footer';

export const renderContactPage = (app: HTMLElement, router: any) => {
    app.innerHTML = `
        <div class="min-h-screen flex flex-col bg-brand-black">
            ${renderHeader()}
            <main class="flex-grow pt-10 pb-20">
                <div class="container mx-auto px-4 max-w-5xl">
                    <h1 class="text-4xl md:text-5xl font-serif font-bold text-center mb-4 text-white">İletişim</h1>
                    <p class="text-center text-brand-gray-400 mb-16 max-w-2xl mx-auto">Randevu ve bilgi almak için bize ulaşın.</p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        <!-- Contact Info -->
                        <div class="space-y-10">
                            <div class="bg-brand-gray-900/50 p-8 rounded-2xl border border-brand-gray-800 hover:border-brand-gray-600 transition-colors">
                                <h3 class="text-2xl font-bold mb-6 flex items-center"><i class="fas fa-map-marker-alt text-brand-gray-400 mr-4"></i> Adres</h3>
                                <p class="text-brand-gray-300 text-lg leading-relaxed">
                                <p class="text-brand-gray-300 text-lg mb-4">
                                    Semerciler Mah. Saray Bosna Cad.<br>
                                    Kadı Sokak No: 2/A<br>
                                    Adapazarı / Sakarya
                                </p>
                                <a href="https://maps.app.goo.gl/jbFVy3qgVb7vx3n37" target="_blank" class="text-brand-gold hover:text-white transition-colors font-medium">
                                    Haritada Görüntüle <i class="fas fa-arrow-right ml-2"></i>
                                </a>
                            </div>

                            <div class="bg-brand-gray-900/50 p-8 rounded-2xl border border-brand-gray-800 hover:border-brand-gray-600 transition-colors">
                                <h3 class="text-2xl font-bold mb-6 flex items-center"><i class="fas fa-phone-alt text-brand-gray-400 mr-4"></i> Telefon</h3>
                                <p class="text-brand-gray-300 text-lg mb-4">
                                    <a href="tel:+905438401054" class="hover:text-white transition-colors block py-2">+90 543 840 10 54</a>
                                </p>
                                <a href="https://wa.me/905438401054" target="_blank" class="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors">
                                    <i class="fab fa-whatsapp text-xl mr-2"></i> WhatsApp'tan Yazın
                                </a>
                            </div>

                            <div class="bg-brand-gray-900/50 p-8 rounded-2xl border border-brand-gray-800 hover:border-brand-gray-600 transition-colors">
                                <h3 class="text-2xl font-bold mb-6 flex items-center"><i class="far fa-clock text-brand-gray-400 mr-4"></i> Çalışma Saatleri</h3>
                                <ul class="space-y-3 text-brand-gray-300 text-lg">
                                    <li class="flex justify-between border-b border-brand-gray-800 pb-2"><span>Pazartesi - Cumartesi</span> <span class="text-white font-medium">10:00 - 20:00</span></li>
                                    <li class="flex justify-between pt-2"><span>Pazar</span> <span class="text-red-400 font-medium">Kapalı</span></li>
                                </ul>
                            </div>
                        </div>

                        <!-- Map Placeholder -->
                        <div class="bg-brand-gray-900 rounded-2xl border border-brand-gray-800 overflow-hidden h-[500px] relative group">
                            <!-- In a real app, embed Google Maps iframe here -->
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d192697.88850588663!2d28.87175409727653!3d41.00546324220794!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab6504620a4df%3A0x6295574574941910!2zSzdEsWvDtnksIMSwc3RhbmJ1bA!5e0!3m2!1str!2str!4v1640000000000!5m2!1str!2str" 
                                width="100%" 
                                height="100%" 
                                style="border:0;" 
                                allowfullscreen="" 
                                loading="lazy" 
                                class="grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                            ></iframe>
                            
                            <div class="absolute bottom-4 left-4 bg-black/80 backdrop-blur px-4 py-2 rounded-lg text-xs text-white border border-white/10 pointer-events-none">
                                <i class="fas fa-map-pin text-red-500 mr-1"></i> Konum Temsilidir
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            ${renderFooter()}
        </div>
    `;

    // Initialize Mobile Menu
    initMobileMenu();
};
