-- Clear all mock data from database
-- This migration removes all test data while preserving the schema
-- Tables affected: bookings, payments, schedules, buses, routes, bus_operators, passengers, cancellations, trips
-- Preserved: regions, auth.users, profiles, commissions

BEGIN;

-- Delete data in order (reverse of creation order due to foreign keys)
DELETE FROM passengers;
DELETE FROM cancellations;
DELETE FROM payments;
DELETE FROM bookings;
DELETE FROM trips;
DELETE FROM schedules;
DELETE FROM buses;
DELETE FROM routes;
DELETE FROM bus_operators;

-- Reset sequences if any
ALTER SEQUENCE IF EXISTS bus_operators_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS routes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS buses_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS schedules_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS bookings_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS payments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS passengers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS cancellations_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS trips_id_seq RESTART WITH 1;

COMMIT;
