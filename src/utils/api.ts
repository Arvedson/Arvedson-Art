// File: src/utils/api.ts

/**
 * fetcher genérico para useSWR: hace fetch a la URL y devuelve el JSON.
 * Lanza un Error si la respuesta no es OK para que SWR lo capture.
 */
export default async function fetcher<T = any>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
      // Opcional: puedes extraer más información del error aquí
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    return res.json();
  }
  