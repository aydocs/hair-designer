export interface Service {
    id: string;
    name: string;
    duration: number; // minutes
    price: string;
}

export interface Booking {
    id: string;
    customerName: string;
    customerPhone: string;
    serviceId: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    createdAt: string;
    status: 'pending' | 'confirmed' | 'cancelled';
}

export const SERVICES: Service[] = [
    { id: '1', name: 'Saç Kesimi', duration: 45, price: '300 TL' },
    { id: '2', name: 'Sakal Kesimi', duration: 30, price: '150 TL' },
    { id: '3', name: 'Saç & Sakal', duration: 75, price: '400 TL' },
    { id: '4', name: 'Saç Bakımı', duration: 60, price: '500 TL' },
];
