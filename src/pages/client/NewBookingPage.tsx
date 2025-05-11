import React, { useEffect, useState } from 'react';

// Filter out invalid points and those without proper coordinates
const filteredPoints = servicePoints.filter(point => 
  point && 
  !isNaN(Number(point.lat)) && 
  !isNaN(Number(point.lng))
)
.map(point => ({
  id: point.id,
  name: point.name,
  address: point.address,
  region: point.region || '',
  city: point.city || '',
  lat: Number(point.lat),
  lng: Number(point.lng),
  partner_id: point.partner_id,
  description: point.description || `Партнер #${point.partner_id}`,
  working_hours: point.working_hours,
  num_posts: point.num_posts
}));

// Log service point stats
useEffect(() => {
  if (Array.isArray(servicePoints)) {
    const totalPoints = servicePoints.length;
    console.log(`Service points: ${totalPoints} total`);
    console.log(`Filtered for map: ${filteredPoints.length} points`);
    
    // Debug first 3 points
    // ... existing code ...
  }
}, [servicePoints, filteredPoints]); 