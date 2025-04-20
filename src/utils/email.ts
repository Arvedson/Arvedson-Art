// src/utils/email.ts
import nodemailer from 'nodemailer';
import { Order } from '@prisma/client'; // Import Order type from Prisma
import { CartItem, CustomerInfo, Address } from '@/types/cart'; // Import types from your cart types file

// Configure the Nodemailer transporter
// Use environment variables for sensitive information
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your SMTP service
  auth: {
    user: process.env.SMTP_USER, // Your email address from .env
    pass: process.env.SMTP_PASS, // Your email password or app-specific password from .env
  },
});

// Function to send the order confirmation email
export async function sendOrderConfirmation(
  order: Order, // The created order object from Prisma
  items: CartItem[], // The items from the order metadata
  customer: CustomerInfo, // The customer info from the order metadata
  address: Address | null // The address from the order metadata
) {
  // Basic validation to ensure we have a recipient email
  if (!customer.email) {
    console.error('❌ No customer email provided for order confirmation email.');
    return; // Exit if no email is available
  }

  // Construct the order status URL
  // Assuming your order status page is at /order/[id]
  // You might need to adjust the base URL for production
  const orderStatusUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order/${order.id}`;

  // Build the email content (HTML)
  let emailBody = `
    <h1>Confirmación de tu compra</h1>
    <p>Gracias por tu pedido, ${customer.name || 'Cliente'}!</p>
    <p>Tu número de pedido es: <strong>${order.id}</strong></p>
    <p>Puedes ver el estado de tu pedido aquí: <a href="${orderStatusUrl}">${orderStatusUrl}</a></p>

    <h2>Resumen del Pedido:</h2>
    <ul>
  `;

  // Add items to the email body
  items.forEach(item => {
    emailBody += `<li>${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</li>`;
  });

  emailBody += `</ul>
    <p><strong>Total: $${order.amountTotal.toFixed(2)}</strong></p>
  `;

  // Add shipping address if available
  if (address?.formattedAddress) {
    emailBody += `
      <h2>Dirección de Envío:</h2>
      <p>${address.formattedAddress}</p>
    `;
  }

  // Add customer contact info
  emailBody += `
    <h2>Datos de Contacto:</h2>
    <p>Nombre: ${customer.name || 'No especificado'}</p>
    <p>Email: ${customer.email || 'No especificado'}</p>
    <p>Teléfono: ${customer.phone || 'No especificado'}</p>
  `;

  // Define email options
  const mailOptions = {
    from: process.env.SMTP_USER, // Sender address (should ideally be a domain email)
    to: customer.email, // Recipient email
    subject: `Confirmación de Pedido #${order.id}`, // Email subject
    html: emailBody, // Email body in HTML format
    // text: 'Plain text version of the email' // Optional: plain text alternative
  };

  // Send the email
  try {
    console.log(`Attempting to send order confirmation email to ${customer.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.response);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // In a production environment, you might want to log this error to a monitoring system
    // or implement a retry mechanism here.
  }
}

// Helper function to parse metadata (copied from webhook, ensure consistency)
// This is included here for completeness if needed elsewhere, but the webhook
// handler already parses the metadata before calling sendOrderConfirmation.
/*
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
*/
