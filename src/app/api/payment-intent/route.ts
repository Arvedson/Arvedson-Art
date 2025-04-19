import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  const { amount, currency, metadata } = await request.json(); 

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      payment_method_types: ['card'],
      metadata: metadata, // Usar metadata directamente
    });

    console.log('💰 PaymentIntent creado:', paymentIntent.id);
    console.log('Metadata enviada:', JSON.stringify(metadata, null, 2));

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('❌ Error creando PaymentIntent:', error);
    return NextResponse.json({ error: 'Failed to create PaymentIntent' }, { status: 500 });
  }
}