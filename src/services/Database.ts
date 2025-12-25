import { Booking, SERVICES } from '../types';

const STORAGE_KEY = 'yusuf_tanik_bookings';
const WHATSAPP_CONNECTED_KEY = 'whatsapp_connected_number';

export function initDatabase() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
}

export function getBookings(): Booking[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

export function createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): { success: boolean, message?: string } {
    const bookings = getBookings();

    // Çakışma Kontrolü (Aynı tarih ve saatte başka rezervasyon var mı?)
    const conflict = bookings.find(b => b.date === booking.date && b.time === booking.time && b.status !== 'cancelled');

    if (conflict) {
        return { success: false, message: 'Seçilen saat için randevu doludur.' };
    }

    const newBooking: Booking = {
        ...booking,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        status: 'pending' // Admin onayı öncesi pending, ama bizim senaryoda direkt iletilecek
    };

    bookings.push(newBooking);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));

    // WhatsApp Simülasyonu
    simulateWhatsappNotification(newBooking);

    return { success: true };
}

export function cancelBooking(id: string) {
    const bookings = getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
        bookings[index].status = 'cancelled';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    }
}

export function getBookedSlots(date: string): string[] {
    const bookings = getBookings();
    return bookings
        .filter(b => b.date === date && b.status !== 'cancelled')
        .map(b => b.time);
}

// WhatsApp Entegrasyon Simülasyonu
function simulateWhatsappNotification(booking: Booking) {
    const connectedNumber = localStorage.getItem(WHATSAPP_CONNECTED_KEY);
    if (connectedNumber) {
        const serviceName = SERVICES.find(s => s.id === booking.serviceId)?.name || 'Hizmet';
        console.log(`%c[WHATSAPP-BOT]`, 'color: #25D366; font-weight: bold; font-size: 14px;');
        console.log(`Gönderen: ${connectedNumber} (Admin Hesabı)`);
        console.log(`Alıcı: Yusuf Tanık`);
        console.log(`Mesaj: 📅 Yeni Randevu! 
    Müşteri: ${booking.customerName} (${booking.customerPhone})
    Hizmet: ${serviceName}
    Tarih: ${booking.date} - ${booking.time}`);

        // Gerçek API olmadığı için alert ile de gösterelim (Demo amaçlı opsiyonel)
        // alert('WhatsApp Bot: Yusuf Tanık hesabına bildirim gönderildi!');
    } else {
        console.warn('WhatsApp hesabı bağlı değil, bildirim gönderilemedi.');
    }
}

export function setWhatsappConnection(phoneNumber: string) {
    localStorage.setItem(WHATSAPP_CONNECTED_KEY, phoneNumber);
}

export function getWhatsappConnection() {
    return localStorage.getItem(WHATSAPP_CONNECTED_KEY);
}
