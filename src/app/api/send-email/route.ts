import { NextResponse } from 'next/server';
import transporter from '@/utils/nodemailer';

export async function POST(request: Request) {
  try {
    const { to, subject, text } = await request.json();

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
    });

    return NextResponse.json({ message: 'Correo enviado correctamente' }, { status: 200 });
  } catch (error) {
    console.error('Error enviando correo:', error);
    return NextResponse.json({ error: 'Error al enviar correo' }, { status: 500 });
  }
}