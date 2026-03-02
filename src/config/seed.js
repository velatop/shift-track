const { sequelize, createUser, Skill } = require('../models');

const seed = async () => {
  await sequelize.sync({ force: true });

  await createUser('admin', 'ShiftTrack2026!');

  await Skill.bulkCreate([
    { name: 'Forklift Operator' },
    { name: 'Safety Certified' },
    { name: 'Receiving' },
    { name: 'Shipping' },
    { name: 'Inventory Control' },
    { name: 'Quality Control' },
  ]);

  console.log('Seed completed: admin user and skills created');
  process.exit(0);
};

seed().catch(console.error);
