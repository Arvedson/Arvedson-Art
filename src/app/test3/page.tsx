// File: src/app/test3/page.tsx
'use client';

import { useState } from 'react';

export default function Test3Page() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Enviando...');

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, text }),
      });

      if (res.ok) {
        setStatus('Correo enviado ✔️');
      } else {
        const data = await res.json();
        setStatus(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Prueba de Envío de Correo</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Para"
          value={to}
          onChange={e => setTo(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Asunto"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <textarea
          placeholder="Mensaje"
          value={text}
          onChange={e => setText(e.target.value)}
          className="p-2 border rounded"
          rows={5}
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Enviar Correo
        </button>
      </form>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}
