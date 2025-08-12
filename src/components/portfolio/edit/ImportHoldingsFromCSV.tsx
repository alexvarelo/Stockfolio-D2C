import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

type CSVHolding = {
  ticker: string;
  quantity: number;
  average_price: number;
  total_invested: number;
  current_price?: number;
  change_percent?: number;
};

interface ImportHoldingsFromCSVProps {
  onImport: (holdings: CSVHolding[]) => Promise<void>;
  onCancel: () => void;
}

export const ImportHoldingsFromCSV = ({ onImport, onCancel }: ImportHoldingsFromCSVProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<CSVHolding[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const parseCSV = useCallback((text: string): CSVHolding[] => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    // Get headers and find column indices
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const tickerIndex = headers.findIndex(h => ['ticker', 'symbol', 'stock'].includes(h));
    const quantityIndex = headers.findIndex(h => ['quantity', 'shares', 'qty'].includes(h));
    const priceIndex = headers.findIndex(h => ['price', 'average price', 'avg price', 'average_price'].includes(h));
    const totalIndex = headers.findIndex(h => ['total', 'total invested', 'total_invested'].includes(h));

    if (tickerIndex === -1 || (quantityIndex === -1 && priceIndex === -1)) {
      throw new Error('CSV must include ticker and either quantity or price columns');
    }

    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const ticker = values[tickerIndex];
      const quantity = quantityIndex >= 0 ? parseFloat(values[quantityIndex]) : 0;
      const average_price = priceIndex >= 0 ? parseFloat(values[priceIndex]) : 0;
      
      // Calculate total if not provided
      let calculatedTotal = totalIndex >= 0 ? parseFloat(values[totalIndex]) : 0;
      let calculatedPrice = average_price;
      
      if (calculatedTotal === 0 && quantity > 0 && calculatedPrice > 0) {
        calculatedTotal = quantity * calculatedPrice;
      } else if (calculatedTotal > 0 && quantity > 0 && calculatedPrice === 0) {
        calculatedPrice = calculatedTotal / quantity;
      }

      return {
        ticker,
        quantity,
        average_price: calculatedPrice,
        total_invested: calculatedTotal,
        current_price: calculatedPrice, // Default to average price
        change_percent: 0, // No change initially
      };
    }).filter(h => h.ticker && (h.quantity > 0 || h.average_price > 0));
  }, []);

  // Handle file selection from input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    await processFile(selectedFile);
    
    // Reset the file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle drag over for the entire window to prevent browser from opening the file
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDragOver);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDragOver);
    };
  }, []);
  
  // Set up and clean up event listeners
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragIn = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragOut = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only set to false if leaving the drop zone
      if (e.relatedTarget === null || !dropZone.contains(e.relatedTarget as Node)) {
        setIsDragging(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (!e.dataTransfer?.files?.length) return;
      
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== 'text/csv' && !droppedFile.name.endsWith('.csv')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a CSV file',
          variant: 'destructive',
        });
        return;
      }
      
      await processFile(droppedFile);
    };

    // Add event listeners
    dropZone.addEventListener('dragenter', handleDragIn);
    dropZone.addEventListener('dragover', handleDragIn);
    dropZone.addEventListener('dragleave', handleDragOut);
    dropZone.addEventListener('drop', handleDrop);

    return () => {
      // Clean up
      dropZone.removeEventListener('dragenter', handleDragIn);
      dropZone.removeEventListener('dragover', handleDragIn);
      dropZone.removeEventListener('dragleave', handleDragOut);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, [toast]);

  const processFile = async (selectedFile: File) => {
    // Check file type
    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setIsLoading(true);

    try {
      const text = await selectedFile.text();
      const parsedData = parseCSV(text);
      
      if (parsedData.length === 0) {
        throw new Error('No valid holdings found in the CSV file');
      }

      setPreviewData(parsedData);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast({
        title: 'Error parsing CSV',
        description: error instanceof Error ? error.message : 'Invalid CSV format',
        variant: 'destructive',
      });
      setPreviewData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;
    
    setIsLoading(true);
    try {
      await onImport(previewData);
      setPreviewData([]);
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error importing holdings:', error);
      toast({
        title: 'Error importing holdings',
        description: 'Failed to import some or all holdings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        ref={dropZoneRef}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200',
          isDragging 
            ? 'border-primary bg-primary/10 scale-[1.01] shadow-md' 
            : 'border-gray-300 dark:border-gray-600',
          isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50',
          'relative overflow-hidden'
        )}
      >
        <div className="text-center">
          <Upload 
            className={cn(
              'mx-auto h-12 w-12 transition-colors',
              isDragging ? 'text-primary' : 'text-gray-300'
            )} 
            aria-hidden="true" 
          />
          <div className="mt-4 flex flex-col items-center text-sm leading-6 text-muted-foreground">
            <div className="flex">
              <label
                htmlFor="csv-upload"
                className={cn(
                  'relative cursor-pointer rounded-md font-medium transition-colors',
                  'text-primary hover:text-primary/80 focus-within:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-primary/50',
                  'focus-visible:ring-offset-2',
                  'disabled:opacity-50 disabled:pointer-events-none',
                  isLoading ? 'opacity-50 pointer-events-none' : ''
                )}
              >
                <span>Upload a CSV file</span>
                <Input
                  ref={fileInputRef}
                  id="csv-upload"
                  name="csv-upload"
                  type="file"
                  className="sr-only"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs mt-1">
              CSV with columns: ticker, quantity, average_price (or similar)
            </p>
          </div>
        </div>
      </div>

      {isLoading && !previewData.length && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          <span>Processing file...</span>
        </div>
      )}

      {previewData.length > 0 && (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Avg. Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((holding, index) => (
                  <TableRow key={`${holding.ticker}-${index}`}>
                    <TableCell className="font-medium">{holding.ticker}</TableCell>
                    <TableCell className="text-right">{holding.quantity}</TableCell>
                    <TableCell className="text-right">
                      ${holding.average_price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${holding.total_invested.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={isLoading || previewData.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${previewData.length} Holdings`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
