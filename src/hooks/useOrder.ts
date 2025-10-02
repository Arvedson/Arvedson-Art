// src/hooks/useOrder.ts
// Custom React hook to fetch order data using SWR

// Corrected import: useSWR is a named export from the 'swr' library
import useSWR from "swr"; // Default export
import fetcher from "@/utils/api"; // Import your fetcher utility

// Define the shape of the order data expected from the API
// You might want to import a more specific type based on your Prisma schema if available
interface OrderData {
  id: string;
  orderStatus: string;
  // Add other order properties you expect to use
  items: any; // Use a more specific type if you have one
  customerInfo: any; // Use a more specific type if you have one
  shippingInfo: any; // Use a more specific type if you have one
  amountTotal: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  events: any[]; // Use a more specific type if you have one
}

/**
 * Hook to fetch order details by ID.
 * @param id The ID of the order to fetch.
 * @returns An object containing order data, error state, and loading state.
 */
export default function useOrder(id: string) {
  // Use useSWR to fetch data from your API route
  // The key is the API endpoint, and the fetcher is the function to call the API
  const { data, error, isLoading } = useSWR<OrderData>(
    `/api/orders/${id}`,
    fetcher
  );

  // Return the fetched data (aliased as order), error, and loading state
  return { order: data, error, isLoading };
}
