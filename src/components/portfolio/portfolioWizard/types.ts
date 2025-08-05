import * as z from 'zod';

export const portfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required'),
  description: z.string().optional(),
  is_public: z.boolean().default(false),
});

export const holdingSchema = z.object({
  ticker: z.string().min(1, 'Ticker is required'),
  company_name: z.string().min(1, 'Company name is required'),
  quantity: z.number().min(0.000001, 'Quantity must be greater than 0'),
  average_price: z.number().min(0.01, 'Price must be greater than 0'),
  notes: z.string().optional(),
});

export interface SearchResult {
  symbol: string;
  name: string;
  exchange?: string;
  type?: string;
}

export interface Holding {
  ticker: string;
  company_name: string;
  quantity: number;
  average_price: number;
  notes?: string;
}
