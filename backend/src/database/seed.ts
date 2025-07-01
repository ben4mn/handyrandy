import { Database } from './database';

export async function seedDatabase(db: Database): Promise<void> {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if data already exists
    const existingAirlines = await db.all('SELECT COUNT(*) as count FROM airlines');
    if (existingAirlines[0]?.count > 0) {
      console.log('📊 Database already contains data, skipping seed');
      return;
    }

    // Sample airlines data
    const airlines = [
      { name: 'American Airlines', codes: 'AA', provider: 'Sabre', status: 'Production' },
      { name: 'Lufthansa Group', codes: 'LH, OS, SN, LX, EN, 4Y', provider: 'Altea NDC', status: 'Production' },
      { name: 'Delta Air Lines', codes: 'DL', provider: 'Accelya (Former Farelogix)', status: 'Production' },
      { name: 'United Airlines', codes: 'UA', provider: 'Sabre', status: 'Pilot' },
      { name: 'British Airways', codes: 'BA', provider: 'Amadeus', status: 'Production' }
    ];

    // Sample features data
    const features = [
      { category: 'Shopping', name: 'Dynamic pricing', description: 'Real-time pricing based on demand and availability' },
      { category: 'Shopping', name: 'Seat selection', description: 'Ability to select specific seats during booking' },
      { category: 'Shopping', name: 'Baggage options', description: 'Selection of different baggage allowances' },
      { category: 'Global', name: 'Unaccompanied minors', description: 'Support for unaccompanied minor bookings' },
      { category: 'Global', name: 'Pet transportation', description: 'Options for pet travel arrangements' },
      { category: 'Booking', name: 'Multi-passenger booking', description: 'Booking for multiple passengers in one transaction' },
      { category: 'Booking', name: 'Group bookings', description: 'Special rates and options for group travel' },
      { category: 'Servicing', name: 'Online check-in', description: 'Web-based check-in functionality' },
      { category: 'Payment', name: 'Corporate payment', description: 'Corporate billing and payment options' }
    ];

    // Insert airlines
    for (const airline of airlines) {
      await db.run(
        'INSERT INTO airlines (name, codes, provider, status) VALUES (?, ?, ?, ?)',
        [airline.name, airline.codes, airline.provider, airline.status]
      );
    }

    // Insert features
    for (const feature of features) {
      await db.run(
        'INSERT INTO features (category, name, description) VALUES (?, ?, ?)',
        [feature.category, feature.name, feature.description]
      );
    }

    // Sample implementation data
    const implementations = [
      // American Airlines (id: 1)
      { airline_id: 1, feature_id: 1, value: 'Yes', notes: 'Full dynamic pricing support' },
      { airline_id: 1, feature_id: 2, value: 'Yes', notes: 'Standard seat selection available' },
      { airline_id: 1, feature_id: 3, value: 'Yes', notes: 'Multiple baggage tiers' },
      { airline_id: 1, feature_id: 4, value: 'Yes', notes: 'Unaccompanied minor service available' },
      { airline_id: 1, feature_id: 5, value: 'No', notes: 'Pet transport not supported via NDC' },
      
      // Lufthansa Group (id: 2)
      { airline_id: 2, feature_id: 1, value: 'Yes', notes: 'Advanced pricing algorithms' },
      { airline_id: 2, feature_id: 2, value: 'Yes', notes: 'Premium seat selection' },
      { airline_id: 2, feature_id: 3, value: 'Yes', notes: 'Flexible baggage options' },
      { airline_id: 2, feature_id: 4, value: 'Limited', notes: 'Select routes only' },
      { airline_id: 2, feature_id: 5, value: 'Yes', notes: 'Full pet transport support' },
      
      // Delta Air Lines (id: 3)
      { airline_id: 3, feature_id: 1, value: 'Yes', notes: 'Market-leading dynamic pricing' },
      { airline_id: 3, feature_id: 2, value: 'Yes', notes: 'Enhanced seat selection' },
      { airline_id: 3, feature_id: 3, value: 'Yes', notes: 'Comprehensive baggage options' },
      { airline_id: 3, feature_id: 4, value: 'Yes', notes: 'Full unaccompanied minor support' },
      { airline_id: 3, feature_id: 5, value: 'Limited', notes: 'Domestic flights only' },
      
      // United Airlines (id: 4)
      { airline_id: 4, feature_id: 1, value: 'Pilot', notes: 'Testing phase' },
      { airline_id: 4, feature_id: 2, value: 'Yes', notes: 'Basic seat selection' },
      { airline_id: 4, feature_id: 3, value: 'No', notes: 'Not yet implemented' },
      { airline_id: 4, feature_id: 4, value: 'No', notes: 'Under development' },
      { airline_id: 4, feature_id: 5, value: 'No', notes: 'Future roadmap item' },
      
      // British Airways (id: 5)
      { airline_id: 5, feature_id: 1, value: 'Yes', notes: 'Sophisticated pricing model' },
      { airline_id: 5, feature_id: 2, value: 'Yes', notes: 'Premium and standard seats' },
      { airline_id: 5, feature_id: 3, value: 'Yes', notes: 'Tiered baggage system' },
      { airline_id: 5, feature_id: 4, value: 'Yes', notes: 'Comprehensive UM service' },
      { airline_id: 5, feature_id: 5, value: 'Yes', notes: 'Full pet travel support' }
    ];

    // Insert implementations
    for (const impl of implementations) {
      await db.run(
        'INSERT INTO implementations (airline_id, feature_id, value, notes) VALUES (?, ?, ?, ?)',
        [impl.airline_id, impl.feature_id, impl.value, impl.notes]
      );
    }

    console.log('✅ Database seeded successfully');
    console.log(`   - ${airlines.length} airlines added`);
    console.log(`   - ${features.length} features added`);
    console.log(`   - ${implementations.length} implementations added`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}