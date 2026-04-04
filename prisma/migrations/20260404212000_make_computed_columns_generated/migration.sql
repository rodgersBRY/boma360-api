-- Convert total_litres to a generated column
ALTER TABLE "milk_logs" DROP COLUMN "total_litres";
ALTER TABLE "milk_logs" ADD COLUMN "total_litres" DECIMAL(7,2) GENERATED ALWAYS AS (morning_litres + evening_litres) STORED;

-- Convert total_amount to a generated column
ALTER TABLE "milk_sales" DROP COLUMN "total_amount";
ALTER TABLE "milk_sales" ADD COLUMN "total_amount" DECIMAL(12,2) GENERATED ALWAYS AS (litres_sold * price_per_litre) STORED;
