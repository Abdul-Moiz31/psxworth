import { StockSelect } from "@/app/portfolio/[portfolioId]/components/TransactionForm/components/StockSelect";
import {
  CommissionInput,
  DateInput,
  DividendPerShareInput,
  NoteInput,
  PricePerShareInput,
  SharesCountInput,
  TransactionTypeSelector,
} from "@/app/portfolio/[portfolioId]/components/TransactionForm/components/TransactionFormFields";
import { FormField } from "@/components/ui/form";
import { TransactionSchemaType } from "@/types";
import React from "react";
import { Control, UseFormWatch, useFormContext } from "react-hook-form";

interface TransactionEditFormProps {
  transaction: TransactionSchemaType;
  control: Control<TransactionSchemaType>;
  watch: UseFormWatch<TransactionSchemaType>;
}

export function TransactionEditForm({ transaction, control, watch }: TransactionEditFormProps) {
  "use no memo";
  const { setValue } = useFormContext<TransactionSchemaType>();

  return (
    <div className="pt-4 mt-2 border-t border-slate-700/50 ">
      <div className="grid grid-cols-1 gap-3">
        <TransactionTypeSelector setValue={setValue} watch={watch} isEditing={false} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <FormField control={control} name="transactionDate" render={({ field }) => <DateInput field={field} />} />
          <FormField control={control} name="stockSymbol" render={({ field }) => <StockSelect field={field} />} />
        </div>

        <FormField control={control} name="numberOfShares" render={({ field }) => <SharesCountInput field={field} />} />

        {transaction.type !== "dividend" && (
          <FormField
            control={control}
            name="pricePerShare"
            render={({ field }) => <PricePerShareInput field={field} />}
          />
        )}

        {transaction.type === "dividend" && (
          <FormField
            control={control}
            name="dividendPerShare"
            render={({ field }) => <DividendPerShareInput field={field} />}
          />
        )}

        <FormField
          control={control}
          name="commissionAndTaxes"
          render={({ field }) => (
            <FormField
              control={control}
              name="isCommissionPercentage"
              render={({ field: toggleField }) => (
                <CommissionInput
                  field={field}
                  isPercentage={watch("isCommissionPercentage")}
                  toggleField={toggleField}
                />
              )}
            />
          )}
        />

        <FormField control={control} name="note" render={({ field }) => <NoteInput field={field} />} />
      </div>
    </div>
  );
}
