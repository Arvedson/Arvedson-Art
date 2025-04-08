'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaRulerCombined, FaPalette, FaCheck, FaInfoCircle } from 'react-icons/fa';

export default function CuadroPersonalizado() {
  const [step, setStep] = useState(1);
  const [spaceImage, setSpaceImage] = useState<File | null>(null);
  const [inspirationImage, setInspirationImage] = useState<File | null>(null);
  const [size, setSize] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (spaceImage && step < 2) setStep(2);
    if ((inspirationImage || size) && step < 3) setStep(3);
  }, [spaceImage, inspirationImage, size, step]);

  const handleFileUpload = (type: 'space' | 'inspiration', file: File) => {
    if (type === 'space') {
      setSpaceImage(file);
      setStep(2);
    } else {
      setInspirationImage(file);
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      if (spaceImage) formData.append('space', spaceImage);
      if (inspirationImage) formData.append('inspiration', inspirationImage);
      formData.append('size', size);
      formData.append('notes', notes);

      await fetch('/api/personalizado', {
        method: 'POST',
        body: formData
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 bg-[var(--secondary)] rounded-xl border border-[var(--border)]"
      >
        <div className="inline-block relative mb-4">
          <FaCheck className="text-4xl text-[var(--primary)]" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--card)] rounded-full flex items-center justify-center border border-[var(--border)]"
          >
            <FaCheck className="text-xs text-[var(--primary)]" />
          </motion.div>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)]">¡Solicitud enviada con éxito!</h3>
        <p className="text-[var(--muted2)] mb-4">Nuestros artistas están revisando tu propuesta</p>
        <p className="text-sm text-[var(--muted2)]">Recibirás un correo de confirmación y un artista se pondrá en contacto contigo en menos de 24 horas.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--card)] p-6 rounded-xl shadow-md border border-[var(--border)]">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2 text-[var(--foreground)]">Crea tu obra maestra</h2>
        <p className="text-[var(--muted2)]">Sigue estos simples pasos para crear tu cuadro perfecto</p>
      </div>

      <div className="mb-8 flex justify-center">
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setStep(num)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                  ${step >= num ? 'bg-[var(--primary)] text-[var(--white)]' : 'bg-[var(--secondary)] text-[var(--muted2)]'}`}
              >
                {num}
              </button>
              {num < 3 && (
                <div className="w-8 h-1 rounded-full bg-[var(--border)]">
                  <motion.div
                    className="h-full bg-[var(--primary)] rounded-full"
                    animate={{ width: step > num ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <AnimatePresence mode='wait'>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-[var(--secondary)] rounded-lg">
                  <FaCloudUploadAlt className="text-[var(--primary)] text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">1. Tu espacio</h3>
                  <p className="text-sm text-[var(--muted2)]">Ayúdanos a visualizar dónde irá el cuadro</p>
                </div>
              </div>
              
              <label 
                htmlFor="space-upload"
                className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
                  ${spaceImage ? 'border-[var(--primary)] bg-[var(--secondary)]' : 'border-[var(--border)] hover:border-[var(--primary)]'}`}
              >
                <input
                  id="space-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('space', e.target.files[0])}
                  required
                />
                <div className="relative pointer-events-none">
                  <FaCloudUploadAlt className={`text-3xl mx-auto mb-3 ${spaceImage ? 'text-[var(--primary)]' : 'text-[var(--muted2)]'}`} />
                  {spaceImage && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-[var(--primary)] text-[var(--white)] rounded-full p-1"
                    >
                      <FaCheck className="text-xs" />
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-[var(--muted2)] mb-2 pointer-events-none">
                  {spaceImage ? 'Foto cargada correctamente' : 'Arrastra o haz clic para subir'}
                </p>
                {spaceImage && (
                  <p className="text-xs text-[var(--muted2)] truncate pointer-events-none">{spaceImage.name}</p>
                )}
              </label>
              
              <div className="flex items-start gap-2 p-3 bg-[var(--secondary)] rounded-lg">
                <FaInfoCircle className="text-[var(--primary)] mt-1 flex-shrink-0" />
                <p className="text-sm text-[var(--muted2)]">
                  Sube una foto del lugar donde planeas colgar el cuadro. Esto nos ayuda a recomendarte 
                  tamaños y estilos que armonicen con tu espacio.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-[var(--secondary)] rounded-lg">
                <FaPalette className="text-[var(--primary)] text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">2. Tu inspiración</h3>
                <p className="text-sm text-[var(--muted2)]">Comparte tus ideas y preferencias</p>
              </div>
            </div>

            <label 
              htmlFor="inspiration-upload"
              className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
                ${inspirationImage ? 'border-[var(--primary)] bg-[var(--secondary)]' : 'border-[var(--border)] hover:border-[var(--primary)]'}`}
            >
              <input
                id="inspiration-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload('inspiration', e.target.files[0])}
              />
              <div className="relative pointer-events-none">
                <FaPalette className={`text-3xl mx-auto mb-3 ${inspirationImage ? 'text-[var(--primary)]' : 'text-[var(--muted2)]'}`} />
                {inspirationImage && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-[var(--primary)] text-[var(--white)] rounded-full p-1"
                  >
                    <FaCheck className="text-xs" />
                  </motion.div>
                )}
              </div>
              <p className="text-sm text-[var(--muted2)] mb-2 pointer-events-none">
                {inspirationImage ? 'Inspiración cargada' : 'Sube imágenes de referencia'}
              </p>
              {inspirationImage && (
                <p className="text-xs text-[var(--muted2)] truncate pointer-events-none">{inspirationImage.name}</p>
              )}
            </label>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 bg-[var(--secondary)] rounded-lg">
                <h4 className="text-sm font-semibold text-[var(--foreground)] mb-2">Ejemplos de inspiración:</h4>
                <ul className="text-sm text-[var(--muted2)] space-y-1">
                  <li>Una obra de arte existente</li>
                  <li>Combinación de colores</li>
                  <li>Fotografías inspiradoras</li>
                </ul>
              </div>
              <div className="p-4 bg-[var(--secondary)] rounded-lg">
                <h4 className="text-sm font-semibold text-[var(--foreground)] mb-2">¿No tienes inspiración?</h4>
                <p className="text-sm text-[var(--muted2)]">
                  Nuestros artistas pueden proponerte ideas basadas en tus gustos
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {step >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-[var(--secondary)] rounded-lg">
                <FaRulerCombined className="text-[var(--primary)] text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">3. Detalles finales</h3>
                <p className="text-sm text-[var(--muted2)]">Especificaciones técnicas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Tamaño del cuadro (cm)
                  <span className="text-[var(--primary)] ml-1">*</span>
                </label>
                <div className="relative">
                  <FaRulerCombined className="absolute left-3 top-3 text-[var(--muted2)]" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:border-[var(--primary)]"
                    placeholder="Ej: 100x150"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    required
                  />
                </div>
                <p className="text-sm text-[var(--muted2)] mt-2">Formato: Ancho x Alto (en centímetros)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Notas para el artista
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg h-32 focus:border-[var(--primary)]"
                  placeholder="Ej: Estilo abstracto, colores cálidos, para sala de estar..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                />
                <p className="text-sm text-[var(--muted2)] mt-2">{500 - notes.length} caracteres restantes</p>
              </div>
            </div>

            <div className="bg-[var(--secondary)] p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-[var(--foreground)] mb-2">¿Necesitas ayuda?</h4>
              <p className="text-sm text-[var(--muted2)]">
                Nuestro tamaño estándar recomendado es 80x120 cm. Si no estás seguro,
                déjalo en blanco y nuestro equipo te contactará para asesorarte.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-8">
        <button
          type="submit"
          disabled={isSubmitting || !spaceImage || !size}
          className="w-full bg-[var(--primary)] text-[var(--white)] px-6 py-3 rounded-lg font-medium
                    hover:bg-[var(--accent)] disabled:bg-[var(--muted)] disabled:cursor-not-allowed
                    transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--white)]"></div>
              Enviando solicitud...
            </>
          ) : (
            <>
              <FaCheck className="text-lg" />
              Enviar solicitud a los artistas
            </>
          )}
        </button>
        <p className="text-center text-sm text-[var(--muted2)] mt-4">
          Al enviar, aceptas nuestro proceso de creación personalizada.
          <br />
          No se realizarán cargos hasta que apruebes el diseño final.
        </p>
      </div>
    </form>
  );
}