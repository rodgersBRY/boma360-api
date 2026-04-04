-- CreateTable
CREATE TABLE "cows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tag_number" VARCHAR(50) NOT NULL,
    "breed" VARCHAR(100) NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "source" VARCHAR(10) NOT NULL,
    "status" VARCHAR(10) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cow_id" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "description" TEXT NOT NULL,
    "drug_used" VARCHAR(200),
    "next_due_date" DATE,
    "record_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breeding_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cow_id" UUID NOT NULL,
    "event_type" VARCHAR(20) NOT NULL,
    "event_date" DATE NOT NULL,
    "expected_calving_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breeding_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milk_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cow_id" UUID NOT NULL,
    "log_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "litres" DECIMAL(6,2) NOT NULL,
    "period" VARCHAR(10) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "milk_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cow_id" UUID NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "expense_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milk_sales" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sale_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "litres_sold" DECIMAL(8,2) NOT NULL,
    "price_per_litre" DECIMAL(8,2) NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "buyer" VARCHAR(200),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "milk_sales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cows_tag_number_key" ON "cows"("tag_number");

-- CreateIndex
CREATE INDEX "cows_status_idx" ON "cows"("status");

-- CreateIndex
CREATE INDEX "cows_tag_number_idx" ON "cows"("tag_number");

-- CreateIndex
CREATE INDEX "health_records_cow_id_idx" ON "health_records"("cow_id");

-- CreateIndex
CREATE INDEX "health_records_next_due_date_idx" ON "health_records"("next_due_date");

-- CreateIndex
CREATE INDEX "breeding_records_cow_id_idx" ON "breeding_records"("cow_id");

-- CreateIndex
CREATE INDEX "breeding_records_expected_calving_date_idx" ON "breeding_records"("expected_calving_date");

-- CreateIndex
CREATE INDEX "breeding_records_event_type_idx" ON "breeding_records"("event_type");

-- CreateIndex
CREATE INDEX "milk_logs_cow_id_idx" ON "milk_logs"("cow_id");

-- CreateIndex
CREATE INDEX "milk_logs_log_date_idx" ON "milk_logs"("log_date");

-- CreateIndex
CREATE UNIQUE INDEX "milk_logs_cow_id_log_date_key" ON "milk_logs"("cow_id", "log_date");

-- CreateIndex
CREATE INDEX "expense_logs_cow_id_idx" ON "expense_logs"("cow_id");

-- CreateIndex
CREATE INDEX "expense_logs_expense_date_idx" ON "expense_logs"("expense_date");

-- CreateIndex
CREATE INDEX "milk_sales_sale_date_idx" ON "milk_sales"("sale_date");

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_cow_id_fkey" FOREIGN KEY ("cow_id") REFERENCES "cows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_records" ADD CONSTRAINT "breeding_records_cow_id_fkey" FOREIGN KEY ("cow_id") REFERENCES "cows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milk_logs" ADD CONSTRAINT "milk_logs_cow_id_fkey" FOREIGN KEY ("cow_id") REFERENCES "cows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_logs" ADD CONSTRAINT "expense_logs_cow_id_fkey" FOREIGN KEY ("cow_id") REFERENCES "cows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
