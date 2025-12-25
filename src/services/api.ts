const API_URL = 'http://localhost:3000/api';

export interface Service {
    id: number;
    name: string;
    duration: number;
    price: number;
    category?: string;
}

export interface Appointment {
    customerName: string;
    customerPhone: string;
    serviceId: number;
    date: string;
    time: string;
}

export const getServices = async (): Promise<Service[]> => {
    const res = await fetch(`${API_URL}/services`);
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
};

export const getAvailableSlots = async (date: string): Promise<string[]> => {
    const res = await fetch(`${API_URL}/slots?date=${date}`);
    if (!res.ok) throw new Error('Failed to fetch slots');
    return res.json();
};

export const createAppointment = async (data: {
    customerName: string;
    customerPhone: string;
    services: { serviceId: number; count: number }[];
    date: string;
    time: string;
}) => {
    const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return result;
};
