ALTER TABLE public.milk_sales ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON TABLE public.milk_sales TO authenticated;

DROP POLICY IF EXISTS "milk_sales_select_authenticated" ON public.milk_sales;
DROP POLICY IF EXISTS "milk_sales_insert_authenticated" ON public.milk_sales;

CREATE POLICY "milk_sales_select_authenticated"
ON public.milk_sales
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "milk_sales_insert_authenticated"
ON public.milk_sales
FOR INSERT
TO authenticated
WITH CHECK (true);
