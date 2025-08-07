import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import {
  CalendarIcon,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TransactionType,
  useCreateTransaction,
  type TransactionFormData,
} from "@/api/transaction/transaction";
import { StockSearch } from "@/components/stock/StockSearch";
import { useGetStockPriceApiV1StockTickerPriceGet } from "@/api/stock/stock";
import { Skeleton } from "@/components/ui/skeleton";

const transactionSchema = z.object({
  portfolio_id: z.string().uuid(),
  ticker: z.string().min(1, "Ticker is required"),
  transaction_type: z.enum(["BUY", "SELL"]),
  quantity: z.number().positive("Quantity must be greater than 0"),
  price_per_share: z.number().positive("Price must be greater than 0"),
  transaction_date: z.string().or(z.date()),
  fees: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  portfolioId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface SelectedInstrument {
  symbol: string;
  name: string;
  exchange?: string;
}

export function TransactionForm({
  portfolioId,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const { mutate: createTransaction, isPending } = useCreateTransaction();
  const [selectedInstrument, setSelectedInstrument] =
    useState<SelectedInstrument | null>(null);

  // Fetch current price when an instrument is selected
  const { data: priceData, isLoading: isLoadingPrice } =
    useGetStockPriceApiV1StockTickerPriceGet(selectedInstrument?.symbol || "", {
      query: {
        enabled: !!selectedInstrument?.symbol,
        refetchOnWindowFocus: false,
      },
    });

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      portfolio_id: portfolioId,
      ticker: "",
      transaction_type: "BUY",
      quantity: 0,
      price_per_share: 0,
      transaction_date: new Date().toISOString().split("T")[0],
      fees: 0,
      notes: "",
    },
  });

  const handleInstrumentSelect = (instrument: SelectedInstrument) => {
    setSelectedInstrument(instrument);
    form.setValue("ticker", instrument.symbol);
    // Auto-fill the price field with the current price if available
    if (priceData?.data?.current_price) {
      form.setValue("price_per_share", priceData.data.current_price);
    }
  };

  const onSubmit = (data: TransactionFormValues) => {
    const transactionData: TransactionFormData = {
      portfolio_id: data.portfolio_id,
      ticker: data.ticker,
      transaction_type: data.transaction_type,
      quantity: data.quantity,
      price_per_share: data.price_per_share,
      transaction_date:
        typeof data.transaction_date === "string"
          ? data.transaction_date
          : data.transaction_date.toISOString().split("T")[0],
      fees: data.fees || 0,
      notes: data.notes || "",
    };

    createTransaction(transactionData, {
      onSuccess: () => {
        form.reset();
        setSelectedInstrument(null);
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Selected Instrument Price Card */}
      {selectedInstrument && (
        <Card className="mb-6">
          <CardContent className="p-4">
            {isLoadingPrice ? (
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-6 w-24 ml-auto" />
                  <Skeleton className="h-4 w-20 ml-auto" />
                </div>
              </div>
            ) : priceData?.data ? (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedInstrument.symbol}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedInstrument.name}
                    {selectedInstrument.exchange &&
                      ` • ${selectedInstrument.exchange}`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    ${priceData.data.current_price?.toFixed(2) || "N/A"}
                  </div>
                  {priceData.data.change_percent !== undefined && (
                    <div
                      className={`text-sm flex items-center justify-end ${
                        (priceData.data.change_percent || 0) >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {(priceData.data.change_percent || 0) >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(priceData.data.change_percent || 0).toFixed(2)}%
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No price data available
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="ticker">Stock Ticker</Label>
            <StockSearch
              onSelect={handleInstrumentSelect}
              placeholder="Search for a stock..."
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.00000001"
              {...form.register("quantity", { valueAsNumber: true })}
            />
            {form.formState.errors.quantity && (
              <p className="text-sm text-destructive">
                {form.formState.errors.quantity.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="price_per_share">Price per Share ($)</Label>
            <Input
              id="price_per_share"
              type="number"
              step="0.01"
              {...form.register("price_per_share", { valueAsNumber: true })}
            />
            {form.formState.errors.price_per_share && (
              <p className="text-sm text-destructive">
                {form.formState.errors.price_per_share.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="transaction_date">Date</Label>
          <Popover modal={true}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !form.watch("transaction_date") && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.watch("transaction_date") ? (
                  format(new Date(form.watch("transaction_date")), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <div onClick={(e) => e.stopPropagation()}>
                <Calendar
                  mode="single"
                  selected={
                    form.watch("transaction_date")
                      ? new Date(String(form.watch("transaction_date")))
                      : undefined
                  }
                  onSelect={(date) => {
                    if (date) {
                      form.setValue(
                        "transaction_date",
                        date.toISOString().split("T")[0]
                      );
                    }
                  }}
                  initialFocus
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="fees">Fees ($)</Label>
          <Input
            id="fees"
            type="number"
            step="0.01"
            {...form.register("fees", { valueAsNumber: true })}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...form.register("notes")}
            placeholder="Add any notes about this transaction"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.watch("transaction_type")} {form.watch("ticker") || "Stock"}
        </Button>
      </div>
    </form>
  );
}
