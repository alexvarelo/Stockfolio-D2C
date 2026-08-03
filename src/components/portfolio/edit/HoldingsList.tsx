import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import type { PortfolioHolding } from '@/api/portfolio/portfolio';
import { CompanyLogo } from '@/components/stock/CompanyLogo';
import { useToast } from '@/components/ui/use-toast';

type Holding = PortfolioHolding;

interface HoldingsListProps {
  holdings: Holding[];
  onUpdateHolding: (_holding: Holding) => Promise<void>;
  onDeleteHolding: (_ticker: string) => Promise<void>;
  className?: string;
}

export const HoldingsList = ({
  holdings,
  onUpdateHolding,
  onDeleteHolding,
  className = ''
}: HoldingsListProps) => {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  // Kept as raw strings while editing so a momentarily-empty or partial input
  // (e.g. "1.") doesn't collapse to NaN and silently break the save button.
  const [quantityInput, setQuantityInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingTicker, setDeletingTicker] = useState<string | null>(null);

  const handleEditClick = (holding: Holding) => {
    setEditingId(holding.ticker);
    setQuantityInput(String(holding.quantity));
    setPriceInput(String(holding.average_price));
  };

  const handleCancel = () => {
    setEditingId(null);
    setQuantityInput('');
    setPriceInput('');
  };

  const handleRemove = async (ticker: string) => {
    if (!confirm(`Remove ${ticker} from this portfolio?`)) return;
    setDeletingTicker(ticker);
    try {
      await onDeleteHolding(ticker);
    } catch {
      // onDeleteHolding already surfaces its own error toast.
    } finally {
      setDeletingTicker(null);
    }
  };

  const handleSave = async (holding: Holding) => {
    const quantity = parseFloat(quantityInput);
    const averagePrice = parseFloat(priceInput);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast({
        title: 'Invalid quantity',
        description: 'Enter a quantity greater than 0.',
        variant: 'destructive',
      });
      return;
    }
    if (!Number.isFinite(averagePrice) || averagePrice <= 0) {
      toast({
        title: 'Invalid price',
        description: 'Enter an average price greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateHolding({
        ...holding,
        quantity,
        average_price: averagePrice,
        total_invested: quantity * averagePrice,
      });
      handleCancel();
    } catch {
      // onUpdateHolding already surfaces its own error toast; keep the row
      // open so the user doesn't lose their edit and can retry.
    } finally {
      setIsSaving(false);
    }
  };

  if (holdings.length === 0) {
    return <p className="text-muted-foreground text-sm py-4">No holdings in this portfolio yet.</p>;
  }

  return (
    <div className={`border rounded-md ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Avg. Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.map((holding) => (
            <TableRow key={holding.ticker}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <CompanyLogo ticker={holding.ticker} size={20} />
                  <span>{holding.ticker}</span>
                </div>
              </TableCell>

              {editingId === holding.ticker ? (
                <>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={quantityInput}
                      onChange={(e) => setQuantityInput(e.target.value)}
                      className="w-24"
                      disabled={isSaving}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      className="w-24"
                      disabled={isSaving}
                    />
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const q = parseFloat(quantityInput);
                      const p = parseFloat(priceInput);
                      const total = Number.isFinite(q) && Number.isFinite(p) ? q * p : 0;
                      return `$${total.toFixed(2)}`;
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSave(holding)}
                        disabled={isSaving}
                      >
                        <span className="sr-only">Save</span>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <span className="sr-only">Cancel</span>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell>{holding.quantity}</TableCell>
                  <TableCell>${holding.average_price.toFixed(2)}</TableCell>
                  <TableCell>${(holding.quantity * holding.average_price).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(holding)}
                      >
                        <span className="sr-only">Edit</span>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(holding.ticker)}
                        disabled={deletingTicker === holding.ticker}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <span className="sr-only">Delete</span>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
