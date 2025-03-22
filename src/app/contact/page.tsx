"use client";

import { useState } from 'react';
import { PhoneIcon, ChatBubbleBottomCenterTextIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import useTheme from "@/hooks/useTheme";

const ContactPage = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Configuración optimizada de clases
  const themeClasses = {
    bgPage: theme === 'light' ? 'bg-[var(--background)]' : 'bg-[var(--primaryblue)]',
    textPrimary: theme === 'light' ? 'text-[var(--foreground)]' : 'text-[var(--foreground)]',
    textSecondary: theme === 'light' ? 'text-[var(--primary)]' : 'text-[var(--primary)]',
    sectionBg: theme === 'light' ? 'bg-[var(--muted)]' : 'bg-[var(--secondary)]',
    border: theme === 'light' ? 'border-[var(--border)]' : 'border-[var(--primary)]',
    button: {
      bg: theme === 'light' ? 'bg-[var(--primary)]' : 'bg-[var(--primary)]',
      hover: theme === 'light' ? 'hover:bg-[var(--primary)]' : 'hover:bg-[var(--primary)]',
      text: theme === 'light' ? 'text-white' : 'text-[var(--primaryblue)]'
    },
    status: {
      error: theme === 'light' ? 'text-red-600' : 'text-red-300',
      success: theme === 'light' ? 'text-green-600' : 'text-green-300'
    }
  };

  // Clases específicas para los botones de contacto
  const contactButtonsClasses = {
    whatsapp: {
      container: `flex items-center space-x-4 p-4 mb-4 rounded-lg transition-colors duration-300 ${
        theme === 'light'
          ? 'whatsapp-light bg-green-100 hover:bg-green-200'
          : 'whatsapp-dark bg-green-800 hover:bg-green-700'
      }`,
      icon: `h-8 w-8 ${
        theme === 'light' ? 'text-green-600' : 'text-green-300'
      }`,
      text: `font-semibold ${
        theme === 'light' ? 'text-[var(--secondary)]' : 'text-[var(--foreground)]'
      }`,
      description: `text-sm ${
        theme === 'light' ? 'text-[var(--muted)]' : 'text-[var(--primary)]'
      }`
    },
    phone: {
      container: `flex items-center space-x-4 p-4 rounded-lg transition-colors duration-300 ${
        theme === 'light'
          ? 'phone-light bg-blue-100 hover:bg-blue-200'
          : 'phone-dark bg-blue-800 hover:bg-blue-700'
      }`,
      icon: `h-8 w-8 ${
        theme === 'light' ? 'text-blue-600' : 'text-blue-300'
      }`,
      text: `font-semibold ${
        theme === 'light' ? 'text-[var(--secondary)]' : 'text-[var(--foreground)]'
      }`,
      description: `text-sm ${
        theme === 'light' ? 'text-[var(--muted)]' : 'text-[var(--primary)]'
      }`
    }
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.name || !formData.email || !formData.message) {
      setSubmitError('Todos los campos son obligatorios');
      return;
    }

    if (!validateEmail(formData.email)) {
      setSubmitError('Por favor ingresa un email válido');
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setSubmitError('Error al enviar el formulario. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${themeClasses.bgPage}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className={`text-4xl font-bold ${themeClasses.textPrimary} mb-4`}>
            Contáctanos
          </h1>
          <p className={`text-lg ${themeClasses.textSecondary}`}>
            ¿Tienes alguna pregunta o solicitud especial? Estamos aquí para ayudarte.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Formulario de contacto */}
          <div className={`${themeClasses.sectionBg} p-8 rounded-xl shadow-lg`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {['name', 'email', 'message'].map((field) => (
                <div key={field}>
                  <label htmlFor={field} className={`block text-sm font-medium ${themeClasses.textPrimary}`}>
                    {field === 'name' && 'Nombre'}
                    {field === 'email' && 'Email'}
                    {field === 'message' && 'Mensaje'}
                  </label>
                  {field !== 'message' ? (
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      id={field}
                      value={formData[field as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className={`mt-1 block w-full rounded-md ${themeClasses.border} shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)]`}
                    />
                  ) : (
                    <textarea
                      id={field}
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={`mt-1 block w-full rounded-md ${themeClasses.border} shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)]`}
                    />
                  )}
                </div>
              ))}

              {submitError && <div className={`text-sm ${themeClasses.status.error}`}>{submitError}</div>}
              {submitSuccess && (
                <div className={`text-sm ${themeClasses.status.success}`}>
                  ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                  themeClasses.button.bg
                } ${themeClasses.button.hover} ${themeClasses.button.text} transition-colors duration-300 disabled:opacity-50`}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          </div>

          {/* Métodos alternativos de contacto */}
          <div className="space-y-8">
            <div className={`${themeClasses.sectionBg} p-8 rounded-xl shadow-lg`}>
              <h2 className={`text-2xl font-bold ${themeClasses.textPrimary} mb-6`}>
                Otros medios de contacto
              </h2>

              {/* WhatsApp */}
              <a
                href="https://wa.me/+1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className={contactButtonsClasses.whatsapp.container}
              >
                <ChatBubbleBottomCenterTextIcon className={contactButtonsClasses.whatsapp.icon} />
                <div>
                  <h3 className={contactButtonsClasses.whatsapp.text}>Chat en vivo</h3>
                  <p className={contactButtonsClasses.whatsapp.description}>Respuesta inmediata por WhatsApp</p>
                </div>
              </a>

              {/* Llamada telefónica */}
              <a
                href="tel:+1234567890"
                className={contactButtonsClasses.phone.container}
              >
                <PhoneIcon className={contactButtonsClasses.phone.icon} />
                <div>
                  <h3 className={contactButtonsClasses.phone.text}>Llamada telefónica</h3>
                  <p className={contactButtonsClasses.phone.description}>Lunes a Viernes: 9am - 6pm</p>
                </div>
              </a>

              {/* Email directo */}
              <div className={`mt-8 pt-6 border-t ${themeClasses.border}`}>
                <div className="flex items-center space-x-4">
                  <EnvelopeIcon className={`h-8 w-8 ${themeClasses.textPrimary}`} />
                  <div>
                    <h3 className={`font-semibold ${themeClasses.textPrimary}`}>Correo electrónico</h3>
                    <a
                      href="mailto:info@artdav.com"
                      className={`${themeClasses.textSecondary} hover:${theme === 'light' ? 'text-[var(--accent)]' : 'text-[var(--accent)]'} transition-colors duration-300`}
                    >
                      domiarvedson@hotmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de ubicación */}
            <div className={`${themeClasses.sectionBg} p-8 rounded-xl shadow-lg`}>
              <h2 className={`text-2xl font-bold ${themeClasses.textPrimary} mb-4`}>
                Nuestra ubicación
              </h2>
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10000!2d-103.37681107552336!3d25.57262968310857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z25.572630N,-103.376811W!5e0!3m2!1ses!2smx!4v1711040200000!5m2!1ses!2smx"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
