// src/app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { sendOrderConfirmation } from '@/utils/email'; // MODIFICADO: importamos la función de envío de correo

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
        console.log('💰 Pago exitoso (PaymentIntent)!');
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Call the handler for successful Payment Intents
        await handlePaymentIntentSucceeded(paymentIntent);
        break;

      case 'charge.succeeded':
        console.log('🔌 Cargo exitoso (Charge):', event.data.object.id);
        // Optionally handle charge.succeeded if needed, but payment_intent.succeeded
        // is generally preferred for order fulfillment workflows.
        // If you only rely on payment_intent.succeeded, you can just log here.
        console.warn('⚠️ Received charge.succeeded event. Order creation is tied to payment_intent.succeeded.');
        break;

      case 'charge.updated':
        console.warn('⚠️ Received charge.updated event. Order creation is tied to payment_intent.succeeded.');
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
    console.log('📦 Iniciando creación de orden a partir de PaymentIntent...');
    console.log('PaymentIntent ID:', paymentIntent.id);

    // Retrieve the full PaymentIntent object to ensure we have all metadata
    const fullPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);

    console.log('Fetched PaymentIntent Metadata:', fullPaymentIntent.metadata); // Log the metadata from the fetched object

    // Parse data from the metadata of the fetched PaymentIntent
    const items = parseMetadata(fullPaymentIntent.metadata.items, 'items');
    const customer = parseMetadata(fullPaymentIntent.metadata.customer, 'customer');
    const address = parseMetadata(fullPaymentIntent.metadata.address, 'address');

    console.log('📝 Datos parseados (desde PaymentIntent) - Items:', items); // Added specific log for items
    console.log('📝 Datos parseados (desde PaymentIntent) - Customer:', customer); // Added specific log for customer
    console.log('📝 Datos parseados (desde PaymentIntent) - Address:', address); // Added specific log for address

    // Validar datos esenciales
    if (!items || !customer) {
      console.error('❌ Datos incompletos en metadata del PaymentIntent para crear orden.'); // More specific error
      throw new Error('Datos incompletos en metadata del PaymentIntent');
    }

    // Crear orden en base de datos
    console.log('Attempting to create order in database with data:', { // Log before database write
      sessionId: fullPaymentIntent.id, // Use ID from fetched object
      items: items,
      customerInfo: {
        name: customer.name || 'No especificado',
        email: customer.email || 'No especificado',
        phone: customer.phone || 'No especificado',
      },
      shippingInfo: address ? address : null, // Ensure address is null if parsing failed or it was not provided
      amountTotal: fullPaymentIntent.amount / 100, // Use amount from fetched object
      paymentStatus: fullPaymentIntent.status, // Use status from fetched object
      orderStatus: 'PAID',
    });

    const order = await prisma.order.create({
      data: {
        sessionId: fullPaymentIntent.id,
        items: items,
        customerInfo: {
          name: customer.name || 'No especificado',
          email: customer.email || 'No especificado',
          phone: customer.phone || 'No especificado',
        },
        shippingInfo: address ? address : null,
        amountTotal: fullPaymentIntent.amount / 100,
        paymentStatus: fullPaymentIntent.status,
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

    // MODIFICADO: Envío de correo de confirmación tras crear la orden
    await sendOrderConfirmation(order, items, customer, address);

  } catch (error) {
    console.error('❌ Error al crear orden:', error);
    // Re-throw the error to be caught by the main webhook handler
    throw error;
  }
}

function parseMetadata(rawData: string | undefined, fieldName: string) {
  try {
    if (!rawData) {
      console.warn(`⚠️ Metadata ${fieldName} no encontrado o vacío.`); // Updated warning
      return null;
    }
    // Attempt to parse the JSON string
    const parsedData = JSON.parse(rawData);
    console.log(`✅ Metadata ${fieldName} parseada exitosamente.`); // Added success log
    return parsedData;
  } catch (error) {
    console.error(`❌ Error parseando ${fieldName}:`, rawData, 'Error:', error); // Added error object to log
    return null;
  }
}