import Navigo from 'navigo';
import Swal from 'sweetalert2';
import { getBookings, cancelBooking, getWhatsappConnection, setWhatsappConnection } from '../services/Database';
import { isAuthenticated, logout } from '../services/Auth';
import { SERVICES } from '../types';

export function renderDashboard(container: HTMLElement, router: Navigo) {
    if (!isAuthenticated()) {
        router.navigate('/login');
        return;
    }

    const render = () => {
        const bookings = getBookings();
        const whatsappNum = getWhatsappConnection();

        container.innerHTML = `
      <div class="min-h-screen bg-brand-dark p-4 md:p-8">
        <header class="max-w-6xl mx-auto flex justify-between items-center mb-8">
          <div>
            <h1 class="text-2xl text-white font-serif">Yönetim Paneli</h1>
            <p class="text-gray-400 text-sm">Hoş geldin, Yusuf Tanık</p>
          </div>
          <button id="logout-btn" class="text-red-400 hover:text-red-300">Çıkış Yap</button>
        </header>

        <main class="max-w-6xl mx-auto space-y-8">
          
          <!-- WhatsApp Connect Section -->
          <div class="bg-brand-gray/50 p-6 rounded-xl border border-gray-700">
            <h3 class="text-lg text-brand-gold mb-4 font-semibold flex items-center gap-2">
              <span class="text-2xl">📱</span> WhatsApp Entegrasyonu
            </h3>
            <div class="flex items-center gap-4">
              <div class="flex-1">
                ${whatsappNum
                ? `<p class="text-green-400">✅ Bağlı Numara: <span class="font-mono text-white">${whatsappNum}</span></p>
                     <p class="text-xs text-gray-500 mt-1">Bu numaradan Yusuf Tanık'a bildirim gidiyor.</p>`
                : `<p class="text-gray-400">Bildirim almak için bir WhatsApp numarası bağlayın.</p>`
            }
              </div>
              ${!whatsappNum ? `
                <button id="connect-whatsapp" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">Hesap Bağla</button>
              ` : `
                <button id="disconnect-whatsapp" class="text-red-400 border border-red-900 px-4 py-2 rounded-lg hover:bg-red-900/20 transition">Bağlantıyı Kes</button>
              `}
            </div>
          </div>

          <!-- Bookings Table -->
          <div class="bg-brand-gray/50 p-6 rounded-xl border border-gray-700 overflow-x-auto">
            <h3 class="text-lg text-white mb-4 font-semibold">Randevular</h3>
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="text-gray-400 border-b border-gray-700">
                  <th class="p-3">Tarih / Saat</th>
                  <th class="p-3">Müşteri</th>
                  <th class="p-3">Hizmet</th>
                  <th class="p-3">Durum</th>
                  <th class="p-3">İşlem</th>
                </tr>
              </thead>
              <tbody class="text-white">
                ${bookings.length === 0 ? `<tr><td colspan="5" class="p-4 text-center text-gray-500">Henüz kayıt yok.</td></tr>` : ''}
                ${bookings.map(b => {
                const srv = SERVICES.find(s => s.id === b.serviceId);
                return `
                    <tr class="border-b border-gray-800 hover:bg-gray-800/50">
                      <td class="p-3">
                        <div class="font-bold">${b.date}</div>
                        <div class="text-sm text-gray-400">${b.time}</div>
                      </td>
                      <td class="p-3">
                        <div>${b.customerName}</div>
                        <div class="text-sm text-gray-500">${b.customerPhone}</div>
                      </td>
                      <td class="p-3">${srv?.name || '-'}</td>
                      <td class="p-3">
                        <span class="px-2 py-1 rounded text-xs font-bold ${b.status === 'cancelled' ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}">
                          ${b.status === 'cancelled' ? 'İptal' : 'Aktif'}
                        </span>
                      </td>
                      <td class="p-3">
                        ${b.status !== 'cancelled' ? `
                          <button class="cancel-btn text-red-500 hover:text-red-400 text-sm underline" data-id="${b.id}">İptal Et</button>
                        ` : '-'}
                      </td>
                    </tr>
                  `;
            }).join('')}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    `;

        // Events
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            logout();
            router.navigate('/login');
        });

        document.getElementById('connect-whatsapp')?.addEventListener('click', () => {
            Swal.fire({
                title: 'WhatsApp Bağla',
                input: 'text',
                inputLabel: 'Bildirim gönderecek numarayı girin (Simülasyon)',
                inputPlaceholder: '53x xxx xx xx',
                background: '#1e293b',
                color: '#fff'
            }).then((res) => {
                if (res.isConfirmed && res.value) {
                    setWhatsappConnection(res.value);
                    render(); // Re-render
                    Swal.fire({ icon: 'success', title: 'Bağlandı', text: 'Artık bu numaradan bildirim simüle edilecek.', background: '#1e293b', color: '#fff' });
                }
            });
        });

        document.getElementById('disconnect-whatsapp')?.addEventListener('click', () => {
            localStorage.removeItem('whatsapp_connected_number');
            render();
        });

        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = (e.target as HTMLElement).getAttribute('data-id')!;
                cancelBooking(id);
                render(); // Refresh
            });
        });
    };

    render();
}
