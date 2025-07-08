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
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
      <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Actualización de tu Pedido</h1>
      <p>Hola <strong>${customer.name || 'Cliente'}</strong>,</p>
  `;

  switch (status) {
    case OrderStatus.PAID:
      subject = `Tu pedido #${order.id} ha sido confirmado`;
      html += `<p>Gracias por tu pago. Tu pedido está listo para entrar en producción.</p>`;
      break;
    case OrderStatus.PRODUCTION:
      subject = `Tu pedido #${order.id} está en producción`;
      html += `<p>El pedido ya está en proceso de fabricación. ¡Está un paso más cerca de ti!</p>`;
      break;
    case OrderStatus.SHIPPED:
      subject = `Tu pedido #${order.id} ha sido enviado`;
      html += `<p>¡Buenas noticias! Tu pedido ha salido de nuestras instalaciones y está en camino.</p>`;
      break;
    case OrderStatus.DELIVERED:
      subject = `Tu pedido #${order.id} ha sido entregado`;
      html += `<p>Esperamos que disfrutes tu compra. ¡Gracias por confiar en Arvedson Art!</p>`;
      break;
    default:
      subject = `Actualización de estado para tu pedido #${order.id}`;
      html += `<p>El estado de tu pedido ha cambiado a: <strong>${status}</strong>.</p>`;
  }

  // Agregar enlace y resumen de pedido
  html += `
    <p>Puedes consultar el estado de tu pedido aquí: 
      <a href="${orderUrl}" style="color: #3498db; text-decoration: none;">${orderUrl}</a>
    </p>

    <h2 style="color: #2c3e50;">Resumen del Pedido</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th style="padding: 10px; border: 1px solid #ddd;">Producto</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Cantidad</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Precio</th>
        </tr>
      </thead>
      <tbody>
  `;

  items.forEach(item => {
    html += `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">
          ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" style="max-width: 100px; border-radius: 4px; margin-bottom: 10px;" />` : ''}
          <br><strong>${item.name}</strong>
        </td>
        <td style="padding: 10px; border: 1px solid #ddd;">x${item.quantity}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="text-align: right; padding: 10px; border: 1px solid #ddd;"><strong>Total:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>$${order.amountTotal.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
  `;

  // Dirección de envío
  if (address?.formattedAddress) {
    html += `
      <h2 style="color: #2c3e50;">Dirección de Envío</h2>
      <p>${address.formattedAddress}</p>
    `;
  }

  // Datos de contacto
  html += `
      <h2 style="color: #2c3e50;">Datos de Contacto</h2>
      <ul style="list-style: none; padding: 0;">
        <li><strong>Nombre:</strong> ${customer.name || 'No especificado'}</li>
        <li><strong>Email:</strong> ${customer.email || 'No especificado'}</li>
        <li><strong>Teléfono:</strong> ${customer.phone || 'No especificado'}</li>
      </ul>

      <p style="margin-top: 30px; font-size: 0.9em; color: #777; border-top: 1px solid #eee; padding-top: 15px;">
        Este correo fue generado automáticamente. Por favor no respondas directamente a este mensaje.
      </p>
    </div>
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
    console.error('❌ No se encontró email del cliente para enviar actualización de estado.');
    return;
  }

  const { subject, html } = buildEmailBody(newStatus, order, items, customer, address);

  const mailOptions = {
    from: `"Arvedson Art" <${process.env.SMTP_USER}>`,
    to: customer.email,
    subject,
    html,
  };

  try {
    console.log(`📧 Enviando correo de estado "${newStatus}" a ${customer.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de estado "${newStatus}" enviado exitosamente: ${info.response}`);
  } catch (error) {
    console.error('❌ Error al enviar email de estado:', error);
  }
}