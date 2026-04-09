ALTER TABLE milk_sales
ALTER COLUMN total_amount DROP EXPRESSION;

DROP FUNCTION IF EXISTS create_calving_with_calf(
  uuid,
  date,
  date,
  text,
  varchar,
  varchar,
  date
);
