import { renderHeader, initMobileMenu } from '../components/Header';
import { renderFooter } from '../components/Footer';
import { login } from '../services/Auth';
import Swal from 'sweetalert2';

export const renderLoginPage = (app: HTMLElement, router: any) => {
    app.innerHTML = `
        <div class="min-h-screen flex flex-col bg-brand-black text-white">
            ${renderHeader()}
            
            <main class="flex-grow flex items-center justify-center relative overflow-hidden py-20 px-4">
               <!-- Background Glow -->
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-3xl -z-10 animate-pulse"></div>

                <div class="bg-brand-gray-900/80 backdrop-blur-md p-10 rounded-3xl border border-brand-gray-800 shadow-2xl w-full max-w-md relative z-10">
                    <div class="text-center mb-10">
                        <div class="w-20 h-20 bg-brand-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-brand-gray-700">
                             <i class="fas fa-lock text-3xl text-brand-gold"></i>
                        </div>
                        <h1 class="text-3xl font-serif font-bold text-white mb-2">Yönetici Girişi</h1>
                        <p class="text-brand-gray-400 text-sm">Lütfen yönetici telefon numaranızı girin.</p>
                    </div>

                    <div class="space-y-6">
                        <div class="group">
                             <label class="block text-xs font-bold text-brand-gray-500 uppercase tracking-widest mb-2 ml-1">Telefon Numarası</label>
                             <div class="relative">
                                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-500 group-focus-within:text-brand-gold transition-colors">
                                    <i class="fas fa-phone"></i>
                                </div>
                                <input type="tel" id="admin-phone" 
                                    class="w-full bg-brand-black/50 border border-brand-gray-800 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all placeholder-brand-gray-700"
                                    placeholder="5XX XXX XX XX">
                             </div>
                        </div>

                        <button id="login-btn" 
                            class="w-full bg-gradient-to-r from-brand-gold to-yellow-600 text-black font-bold py-4 rounded-xl shadow-lg hover:shadow-brand-gold/20 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                            <span>GİRİŞ YAP</span>
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>

                    <div class="mt-8 text-center">
                         <a href="/" data-navigo class="text-brand-gray-500 hover:text-white text-sm transition-colors flex items-center justify-center gap-2">
                            <i class="fas fa-arrow-left"></i> Ana Sayfaya Dön
                         </a>
                    </div>
                </div>
            </main>

            ${renderFooter()}
        </div>
    `;

    initMobileMenu();

    document.getElementById('login-btn')?.addEventListener('click', () => {
        const phoneInput = document.getElementById('admin-phone') as HTMLInputElement;
        const phone = phoneInput.value.replace(/\s/g, ''); // Remove spaces

        if (login(phone)) {
            Swal.fire({
                icon: 'success',
                title: 'Giriş Başarılı',
                text: 'Yönetim paneline yönlendiriliyorsunuz...',
                timer: 1500,
                showConfirmButton: false,
                background: '#111',
                color: '#fff'
            }).then(() => {
                router.navigate('/branding/dashboard'); // Assuming dashboard route or similar
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erişim Reddedildi',
                text: 'Bu telefon numarası yetkili değil.',
                confirmButtonColor: '#D4AF37',
                background: '#111',
                color: '#fff'
            });
        }
    });
};
