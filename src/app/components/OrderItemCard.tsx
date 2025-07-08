// components/OrderItemCard.tsx
'use client';
import useTheme from "@/hooks/useTheme";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  [key: string]: any;
}

export default function OrderItemCard({ item }: { item: OrderItem }) {
  const theme = useTheme();
  const subtotal = item.quantity * item.price;

  return (
    <div className={`flex items-start gap-3 p-3 border rounded-lg transition-all duration-200 ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
        : 'bg-white border-gray-200 hover:bg-gray-50'
    }`}>
      {/* Imagen */}
      <div className="w-16 h-16 flex-shrink-0">
        {item.imageUrl ? (
          <div className={`relative w-full h-full rounded-md overflow-hidden border ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <img
              src={item.imageUrl}
              alt={item.name || 'Producto'}
              className={`object-cover w-full h-full ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            />
          </div>
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-xs rounded border ${
            theme === 'dark' 
              ? 'bg-gray-700 border-gray-600 text-gray-300' 
              : 'bg-gray-100 border-gray-200 text-gray-600'
          }`}>
            Sin imagen
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 min-w-0">
        <h3 className={`font-medium line-clamp-2 ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          {item.name}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {item.quantity} × ${item.price.toFixed(2)}
          </p>
          <span className={`text-xs ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>•</span>
          <p className={`text-sm font-medium ${
            theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
          }`}>
            ${subtotal.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}