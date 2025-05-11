<?php

// Standard working hours format with object format
$workingHoursNewFormat = [
    'monday' => ['open' => '09:00', 'close' => '18:00'],
    'tuesday' => ['open' => '09:00', 'close' => '18:00'],
    'wednesday' => ['open' => '09:00', 'close' => '18:00'],
    'thursday' => ['open' => '09:00', 'close' => '18:00'],
    'friday' => ['open' => '09:00', 'close' => '18:00'],
    'saturday' => ['open' => '10:00', 'close' => '16:00'],
    'sunday' => 'closed',
];

// Print the JSON format for reference
echo "Working hours in JSON format:\n";
echo json_encode($workingHoursNewFormat, JSON_PRETTY_PRINT);
echo "\n\n";

// Old format for comparison (string format)
$workingHoursOldFormat = [
    'monday' => '09:00-18:00',
    'tuesday' => '09:00-18:00',
    'wednesday' => '09:00-18:00',
    'thursday' => '09:00-18:00',
    'friday' => '09:00-18:00',
    'saturday' => '10:00-16:00',
    'sunday' => 'closed',
];

// Print the old format for reference
echo "Old working hours format:\n";
echo json_encode($workingHoursOldFormat, JSON_PRETTY_PRINT);
echo "\n\n";

// Test Ukrainian business hours (extended/variable hours)
$workingHoursUkrainian = [
    'monday' => ['open' => '08:30', 'close' => '19:00'],
    'tuesday' => ['open' => '08:30', 'close' => '19:00'],
    'wednesday' => ['open' => '08:30', 'close' => '19:00'],
    'thursday' => ['open' => '08:30', 'close' => '19:00'],
    'friday' => ['open' => '08:30', 'close' => '19:00'],
    'saturday' => ['open' => '09:00', 'close' => '17:00'],
    'sunday' => ['open' => '10:00', 'close' => '15:00'], // Open on Sunday
];

// Print the Ukrainian format for reference
echo "Ukrainian working hours format:\n";
echo json_encode($workingHoursUkrainian, JSON_PRETTY_PRINT); 