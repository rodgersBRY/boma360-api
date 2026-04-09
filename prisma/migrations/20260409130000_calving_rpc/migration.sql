CREATE OR REPLACE FUNCTION create_calving_with_calf(
  p_cow_id uuid,
  p_event_date date,
  p_expected_calving_date date,
  p_notes text,
  p_calf_tag_number varchar,
  p_calf_breed varchar,
  p_calf_date_of_birth date
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_breeding_record breeding_records;
  v_calf cows;
BEGIN
  INSERT INTO breeding_records (cow_id, event_type, event_date, expected_calving_date, notes)
  VALUES (p_cow_id, 'calving', p_event_date, p_expected_calving_date, p_notes)
  RETURNING * INTO v_breeding_record;

  INSERT INTO cows (tag_number, breed, date_of_birth, source)
  VALUES (p_calf_tag_number, p_calf_breed, p_calf_date_of_birth, 'born')
  RETURNING * INTO v_calf;

  RETURN jsonb_build_object(
    'breeding_record', to_jsonb(v_breeding_record),
    'calf', to_jsonb(v_calf)
  );
END;
$$;
