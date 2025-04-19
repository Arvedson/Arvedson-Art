// src/app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  
  console.log('[Webhook] Iniciando procesamiento de evento');
  console.log('[Webhook] Cabecera de firma:', signature?.slice(0, 20) + '...');

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('✅ Evento Stripe verificado:', event.type);
    console.log('Detalles completos del evento:', JSON.stringify(event, null, 2));

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('💰 Pago exitoso!');
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      
      case 'charge.succeeded':
        console.log('🔌 Cargo exitoso:', event.data.object.id);
        break;
      
      default:
        console.warn(`⚠️ Evento no manejado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('📦 Iniciando creación de orden...');
    console.log('PaymentIntent Metadata:', paymentIntent.metadata);

    // Parsear datos del metadata
    const items = parseMetadata(paymentIntent.metadata.items, 'items');
    const customer = parseMetadata(paymentIntent.metadata.customer, 'customer');
    const address = parseMetadata(paymentIntent.metadata.address, 'address');

    console.log('📝 Datos parseados:', { items, customer, address });

    // Validar datos esenciales
    if (!items || !customer) {
      throw new Error('Datos incompletos en metadata');
    }

    // Crear orden en base de datos
    const order = await prisma.order.create({
      data: {
        sessionId: paymentIntent.id,
        items: items,
        customerInfo: {
          name: customer.name || 'No especificado',
          email: customer.email || 'No especificado',
          phone: customer.phone || 'No especificado',
        },
        shippingInfo: address || null,
        amountTotal: paymentIntent.amount / 100,
        paymentStatus: paymentIntent.status,
        orderStatus: 'PAID',
      },
    });

    console.log('🎉 Orden creada exitosamente:', order);
    console.log('ID de orden:', order.id);

    // Crear evento asociado
    const orderEvent = await prisma.event.create({
      data: {
        orderId: order.id,
        status: 'PAID',
        description: 'Pago completado exitosamente',
      },
    });

    console.log('📌 Evento de orden creado:', orderEvent);

  } catch (error) {
    console.error('❌ Error al crear orden:', error);
    throw error;
  }
}

function parseMetadata(rawData: string | undefined, fieldName: string) {
  try {
    if (!rawData) {
      console.warn(`⚠️ Metadata ${fieldName} no encontrado`);
      return null;
    }
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`❌ Error parseando ${fieldName}:`, rawData);
    return null;
  }
}