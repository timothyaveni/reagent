import seedAIModels from './aiModels/aiModels.js';
import seedNoggins from './noggins/noggins.js';
import seedUsers from './users/users.js';

console.log('Seeding AI models and providers');
await seedAIModels();

console.log('Seeding users');
await seedUsers();

console.log('Seeding noggins and revisions');
await seedNoggins();
