// File: src/utils/orderStatusEmail.ts

import nodemailer from 'nodemailer';
import { Order } from '@prisma/client';
import { CartItem, CustomerInfo, Address } from '@/types/cart';

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export enum OrderStatus {
  PAID = 'PAID',
  PRODUCTION = 'PRODUCTION',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
}

/**
 * Construye el contenido HTML y el asunto del correo
 * según el nuevo estado del pedido.
 */
function buildEmailBody(
  status: OrderStatus,
  order: Order,
  items: CartItem[],
  customer: CustomerInfo,
  address: Address | null,
): { subject: string; html: string } {
  const orderUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order/${order.id}`;
  let subject = '';
  let html = `
    <h1>Actualización de tu pedido</h1>
    <p>Hola ${customer.name || 'Cliente'},</p>
  `;

  switch (status) {
    case OrderStatus.PAID:
      subject = `Tu pedido #${order.id} ha sido confirmado`;
      html += `<p>Hemos recibido tu pago con éxito. ¡Gracias por tu compra!</p>`;
      break;
    case OrderStatus.PRODUCTION:
      subject = `Tu pedido #${order.id} está en producción`;
      html += `<p>Tu pedido ya está en proceso de producción. Te notificaremos cuando esté listo para envío.</p>`;
      break;
    case OrderStatus.SHIPPED:
      subject = `Tu pedido #${order.id} ha sido enviado`;
      html += `<p>¡Buenas noticias! Tu pedido ha salido de nuestras instalaciones y está en camino.</p>`;
      break;
    case OrderStatus.DELIVERED:
      subject = `Tu pedido #${order.id} ha sido entregado`;
      html += `<p>Esperamos que disfrutes tu compra. ¡Gracias por confiar en nosotros!</p>`;
      break;
    default:
      subject = `Actualización de estado para tu pedido #${order.id}`;
      html += `<p>El estado de tu pedido ha cambiado a: <strong>${status}</strong>.</p>`;
  }

  // Agregar enlace y resumen de pedido
  html += `
    <p>Puedes consultar el estado de tu pedido aquí: <a href="${orderUrl}">${orderUrl}</a></p>
    <h2>Resumen del Pedido:</h2>
    <ul>
  `;
  items.forEach(item => {
    html += `<li>${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</li>`;
  });
  html += `</ul>
    <p><strong>Total: $${order.amountTotal.toFixed(2)}</strong></p>
  `;

  // Dirección de envío si existe
  if (address?.formattedAddress) {
    html += `
      <h2>Dirección de Envío:</h2>
      <p>${address.formattedAddress}</p>
    `;
  }

  html += `
    <p>Saludos,<br/>El equipo de tu Tienda</p>
  `;

  return { subject, html };
}

/**
 * Envía un correo notificando el cambio de estado del pedido.
 */
export async function sendOrderStatusEmail(
  order: Order,
  newStatus: OrderStatus,
  items: CartItem[],
  customer: CustomerInfo,
  address: Address | null,
) {
  if (!customer.email) {
    console.error('No se encontró email del cliente para enviar actualización de estado.');
    return;
  }

  const { subject, html } = buildEmailBody(newStatus, order, items, customer, address);

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: customer.email,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email de estado "${newStatus}" enviado a ${customer.email}: ${info.response}`);
  } catch (error) {
    console.error('Error al enviar email de estado:', error);
  }
}
