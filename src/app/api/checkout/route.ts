import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { CartState } from '../../../types/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  const { state: cartState } = await request.json();

  try {
    // Crear PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(cartState.total * 100), // Total en centavos
      currency: 'mxn',
      metadata: {
        items: JSON.stringify(cartState.items),
        customer: JSON.stringify(cartState.customer),
        address: JSON.stringify(cartState.address),
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear PaymentIntent' }, { status: 500 });
  }
}