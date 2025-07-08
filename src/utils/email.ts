import nodemailer from 'nodemailer';
import { Order } from '@prisma/client';
import { CartItem, CustomerInfo, Address } from '@/types/cart';

// Configura el transportador de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Envia un correo de confirmación de pedido con imágenes incluidas
 */
export async function sendOrderConfirmation(
  order: Order,
  items: CartItem[],
  customer: CustomerInfo,
  address: Address | null
) {
  if (!customer.email) {
    console.error('❌ No se proporcionó un correo para el cliente');
    return;
  }

  // URL del estado del pedido
  const orderStatusUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order/${order.id}`;

  // Generar el cuerpo del correo con estilo profesional
  let emailBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
      <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Confirmación de tu compra</h1>
      <p>Hola <strong>${customer.name || 'Cliente'}</strong>,</p>
      <p>Gracias por tu pedido. Tu número de pedido es: <strong>${order.id}</strong></p>
      <p>Puedes revisar el estado de tu pedido en cualquier momento aquí: 
        <a href="${orderStatusUrl}" style="color: #3498db; text-decoration: none;">${orderStatusUrl}</a>
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

  // Agregar cada producto con imagen
  items.forEach(item => {
    emailBody += `
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

  emailBody += `
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
    emailBody += `
      <h2 style="color: #2c3e50;">Dirección de Envío</h2>
      <p>${address.formattedAddress}</p>
    `;
  }

  // Datos de contacto
  emailBody += `
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

  // Configuración del correo
  const mailOptions = {
    from: `"Arvedson Art" <${process.env.SMTP_USER}>`,
    to: customer.email,
    subject: `✅ Pedido Confirmado #${order.id} - Arvedson Art`,
    html: emailBody,
  };

  try {
    console.log(`📧 Enviando correo de confirmación a ${customer.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado exitosamente:', info.response);
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
  }
}