// src/app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { sendOrderConfirmation } from '@/utils/email';

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

    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('💰 Pago exitoso (PaymentIntent)!');
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;

      case 'charge.succeeded':
        console.log('🔌 Cargo exitoso (Charge):', event.data.object.id);
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

    const fullPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);

    console.log('Fetched PaymentIntent Metadata:', fullPaymentIntent.metadata);

    const items = parseMetadata(fullPaymentIntent.metadata.items, 'items');
    const customer = parseMetadata(fullPaymentIntent.metadata.customer, 'customer');
    const address = parseMetadata(fullPaymentIntent.metadata.address, 'address');

    console.log('📝 Datos parseados - Items:', items);
    console.log('📝 Datos parseados - Customer:', customer);
    console.log('📝 Datos parseados - Address:', address);

    if (!items || !Array.isArray(items) || !customer) {
      console.error('❌ Datos incompletos o formato incorrecto en metadata');
      throw new Error('Datos incompletos o formato inválido en metadata');
    }

    // Obtener información real de los productos desde la DB
    console.log('🔍 Buscando productos en base de datos para enriquecer items...');

const enrichedItems = await Promise.all(
  items.map(async (item: any) => {
    let product;

    if (item.type === 'stock_artwork') {
      console.log(`🔎 Buscando StockArtwork con ID: ${item.id}`);
      product = await prisma.stockArtwork.findUnique({
        where: { id: item.id },
      });
    } else {
      console.log(`🔎 Buscando Artwork con ID: ${item.id}`);
      product = await prisma.artwork.findUnique({
        where: { id: item.id },
      });
    }

    if (!product) {
      console.warn(`🚫 Producto no encontrado: ID=${item.id}, Tipo=${item.type}`);
      return null;
    }

    console.log(`✅ Producto encontrado: ${product.title} | URL: ${product.mainImageUrl}`);

    return {
      ...item,
      imageUrl: product.mainImageUrl,
    };
  })
);

    const validItems = enrichedItems.filter(Boolean);

    if (validItems.length === 0) {
      console.error('❌ No se encontró ningún producto válido en la base de datos');
      throw new Error('No se encontró ningún producto válido');
    }

    console.log('🖼️ Items enriquecidos con imagen:', validItems);

    // Crear orden en la base de datos
    console.log('💾 Guardando orden en la base de datos...');

    const order = await prisma.order.create({
      data: {
        sessionId: fullPaymentIntent.id,
        items: validItems,
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

    console.log('🎉 Orden creada exitosamente:', order.id);

    // Registrar evento asociado
    const orderEvent = await prisma.event.create({
      data: {
        orderId: order.id,
        status: 'PAID',
        description: 'Pago completado exitosamente',
      },
    });

    console.log('📌 Evento de orden creado:', orderEvent.id);

    // Enviar correo de confirmación
    console.log('✉️ Enviando correo de confirmación...');
    await sendOrderConfirmation(order, validItems, customer, address);
    console.log('✅ Correo de confirmación enviado.');

  } catch (error) {
    console.error('❌ Error al crear orden:', error);
    throw error;
  }
}

function parseMetadata(rawData: string | undefined, fieldName: string) {
  try {
    if (!rawData) {
      console.warn(`⚠️ Metadata ${fieldName} no encontrado o vacío.`);
      return null;
    }
    const parsedData = JSON.parse(rawData);
    console.log(`✅ Metadata ${fieldName} parseada exitosamente.`);
    return parsedData;
  } catch (error) {
    console.error(`❌ Error parseando ${fieldName}:`, rawData, 'Error:', error);
    return null;
  }
}