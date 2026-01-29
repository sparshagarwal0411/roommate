-- SQL Migration: Create generate_monthly_bills RPC function
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION generate_monthly_bills(hostel_id_param UUID)
RETURNS void AS $$
DECLARE
    current_month_str TEXT;
    rec RECORD;
    room_rec RECORD;
    full_type_str TEXT;
BEGIN
    -- Get current month in YYYY-MM format
    current_month_str := to_char(CURRENT_DATE, 'YYYY-MM');

    -- Loop through active recurring bills for this hostel
    FOR rec IN 
        SELECT * FROM recurring_bills 
        WHERE hostel_id = hostel_id_param AND is_active = true
    LOOP
        -- If target_room is 'all', we need to find all unique rooms in the hostel
        IF rec.target_room = 'all' THEN
            FOR room_rec IN 
                SELECT DISTINCT room_no FROM members 
                WHERE hostel_id = hostel_id_param AND room_no IS NOT NULL
            LOOP
                -- Construct full_type
                IF rec.bill_type = 'other' THEN
                    full_type_str := rec.bill_type || '|' || room_rec.room_no || '|' || COALESCE(rec.description, '');
                ELSE
                    full_type_str := rec.bill_type || '|' || room_rec.room_no;
                END IF;

                -- Insert if not exists
                INSERT INTO utility_bills (hostel_id, bill_type, amount, month, paid)
                SELECT hostel_id_param, full_type_str, rec.amount, current_month_str, false
                WHERE NOT EXISTS (
                    SELECT 1 FROM utility_bills 
                    WHERE hostel_id = hostel_id_param 
                    AND bill_type = full_type_str 
                    AND month = current_month_str
                );
            END LOOP;
        ELSE
            -- Specific room
            IF rec.bill_type = 'other' THEN
                full_type_str := rec.bill_type || '|' || rec.target_room || '|' || COALESCE(rec.description, '');
            ELSE
                full_type_str := rec.bill_type || '|' || rec.target_room;
            END IF;

            -- Insert if not exists
            INSERT INTO utility_bills (hostel_id, bill_type, amount, month, paid)
            SELECT hostel_id_param, full_type_str, rec.amount, current_month_str, false
            WHERE NOT EXISTS (
                SELECT 1 FROM utility_bills 
                WHERE hostel_id = hostel_id_param 
                AND bill_type = full_type_str 
                AND month = current_month_str
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
