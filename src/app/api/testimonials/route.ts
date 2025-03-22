import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, testimonial, rating } = body;

    // Validación básica
    if (!name || !testimonial || !rating) {
      return new Response(JSON.stringify({ error: "Todos los campos son obligatorios" }), { status: 400 });
    }

    // Crear el testimonio en la base de datos
    const newTestimonial = await prisma.testimonial.create({
      data: {
        name,
        testimonial,
        rating: parseInt(rating, 10), // Aseguramos que el rating sea un número
      },
    });

    return new Response(JSON.stringify(newTestimonial), { status: 201 });
  } catch (error) {
    console.error("Error al crear el testimonio:", error);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
}

export async function GET() {
  try {
    // Obtener todos los testimonios
    const testimonials = await prisma.testimonial.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify(testimonials), { status: 200 });
  } catch (error) {
    console.error("Error al obtener los testimonios:", error);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    
    await prisma.testimonial.delete({
      where: { id }
    });
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return new Response(JSON.stringify({ error: "Error deleting testimonial" }), { status: 500 });
  }
}