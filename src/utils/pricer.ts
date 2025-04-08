type PriceEntry = {
    width: number;
    height: number;
    price: number;
  };
  
  const fetchPriceData = async (): Promise<PriceEntry[]> => {
    try {
      const response = await fetch('/api/framecost');
      if (!response.ok) throw new Error('Error fetching price data');
      
      const data = await response.json();
      
      return data.map(({ width, height, price }: PriceEntry) => ({
        width: Math.max(width, height),
        height: Math.min(width, height),
        price
      })).sort((a: PriceEntry, b: PriceEntry) => 
        a.width - b.width || a.height - b.height
      );
      
    } catch (error) {
      console.error('Failed to fetch price data:', error);
      throw error;
    }
  };
  
  export const calculateFramePrice = async (
    inputWidth: number,
    inputHeight: number
  ): Promise<number> => {
    const PRICE_TABLE = await fetchPriceData();
    
    // Normalizar dimensiones
    const width = Math.max(inputWidth, inputHeight);
    const height = Math.min(inputWidth, inputHeight);
  
    // Buscar coincidencia exacta
    const exactMatch = PRICE_TABLE.find(entry => 
      entry.width === width && entry.height === height
    );
    
    if (exactMatch) return exactMatch.price;
  
    // Encontrar la mejor coincidencia
    const candidates = PRICE_TABLE.filter(entry => 
      entry.width >= width && entry.height >= height
    );
  
    if (candidates.length > 0) {
      // Tomar la coincidencia más pequeña que cumple con las dimensiones
      const bestMatch = candidates.reduce((prev, curr) => 
        (prev.width + prev.height) < (curr.width + curr.height) ? prev : curr
      );
      return bestMatch.price;
    }
  
    // Calcular precio proporcional para dimensiones mayores a las existentes
    const largestEntry = PRICE_TABLE[PRICE_TABLE.length - 1];
    const widthRatio = width / largestEntry.width;
    const heightRatio = height / largestEntry.height;
    const scaleFactor = Math.max(widthRatio, heightRatio);
    
    return Math.ceil(largestEntry.price * scaleFactor);
  };
  
