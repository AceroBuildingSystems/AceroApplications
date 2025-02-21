import { seedInventoryAccess } from './data/InventoryAccess.scripts.data';

async function seedAllData() {
    console.log('Starting data seeding...');

    try {
        // Seed inventory access data
        await seedInventoryAccess();
        
        // Add other seeders here as needed
        
        console.log('All data seeded successfully');
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
    seedAllData()
        .then(() => {
            console.log('Seeding complete');
            process.exit(0);
        })
        .catch(error => {
            console.error('Seeding failed:', error);
            process.exit(1);
        });
}