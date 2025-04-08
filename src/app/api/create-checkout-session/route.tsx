import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Corregimos el apiVersion para que coincida con el tipo esperado.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
    try {
        const { amount, customerInfo } = await request.json(); // <-- Recibe customerInfo

        // Aquí puedes procesar la información del cliente
        console.log('Información del Cliente:', customerInfo);
        // TODO: Guardar esta información en tu base de datos si es necesario

        // Configura el único producto (tu cuadro) con precio y cantidad 1.
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'mxn', // o 'mxn' según necesites
                        product_data: {
                            name: 'Cuadro Exclusivo',
                            // Incluye el tamaño solo si customerInfo y customerInfo.size existen
                            description: customerInfo?.size ? `Tamaño: ${customerInfo.size}` : 'Tamaño no especificado',
                        },
                        unit_amount: amount * 100, // Stripe usa centavos
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.headers.get('origin')}/cancel`,
            // Incluye metadatos solo si customerInfo existe
            metadata: customerInfo ? {
                nombre: customerInfo.name || '',  // Evita undefined en metadatos
                direccion: customerInfo.address || '', // Evita undefined en metadatos
                tamano: customerInfo.size || '',    // Evita undefined en metadatos
            } : {},
        });

        return NextResponse.json({ id: session.id });
    } catch (error: unknown) {
        // Se valida el tipo de error para asegurar que es del tipo Error y así acceder a error.message
        if (error instanceof Error) {
            console.error(error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        // En caso de que no sea una instancia de Error, se maneja de forma genérica.
        console.error('Error desconocido:', error);
        return NextResponse.json({ error: 'Ocurrió un error desconocido' }, { status: 500 });
    }
}
