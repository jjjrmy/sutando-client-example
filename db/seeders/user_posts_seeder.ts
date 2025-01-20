import { faker } from '@faker-js/faker';
import User from '~/models/User';
import Post from '~/models/Post';
import config from '../../sutando.config.cjs';
import { sutando } from 'sutando';

sutando.addConnection(config);

async function seed() {
    try {
        console.log('🌱 Starting to seed users and posts...');

        // Create 3 users directly in the database
        const users = await Promise.all(
            Array.from({ length: 3 }, async () => {
                const user = await User.query().create({
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    created_at: faker.date.past(),
                    updated_at: faker.date.recent(),
                });
                return user.id;
            })
        );

        console.log(`✅ Created ${users.length} users`);

        // Create 2-5 posts for each user
        let totalPosts = 0;
        for (const userId of users) {
            const numberOfPosts = faker.number.int({ min: 2, max: 5 });

            await Promise.all(
                Array.from({ length: numberOfPosts }, async () => {
                    await Post.query().create({
                        user_id: userId,
                        title: faker.lorem.sentence(),
                        content: faker.lorem.paragraphs(3),
                        created_at: faker.date.past(),
                        updated_at: faker.date.recent(),
                    });
                    totalPosts++;
                })
            );
        }

        console.log(`✅ Created ${totalPosts} posts`);
        console.log('✨ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error while seeding:', error);
        throw error;
    }
}

// Run the seed function
seed().catch(console.error);
