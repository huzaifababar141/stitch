import { PrismaClient, UserRole, Gender } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123456', 10);

  console.log('Seeding super_admin...');
  await prisma.user.upsert({
    where: { email: 'admin@tailoring.local' },
    update: {},
    create: {
      phone: '+923001111111',
      email: 'admin@tailoring.local',
      password: passwordHash,
      role: UserRole.super_admin,
      firstName: 'Super',
      lastName: 'Admin',
      phoneVerified: true,
      lastLogin: new Date(),
    },
  });

  console.log('Seeding admin...');
  await prisma.user.upsert({
    where: { email: 'ops@tailoring.local' },
    update: {},
    create: {
      phone: '+923001111112',
      email: 'ops@tailoring.local',
      password: passwordHash,
      role: UserRole.admin,
      firstName: 'Operations',
      lastName: 'Admin',
      phoneVerified: true,
    },
  });

  console.log('Seeding tailors...');
  const tailor1 = await prisma.user.upsert({
    where: { phone: '+923002222221' },
    update: {},
    create: {
      phone: '+923002222221',
      password: passwordHash,
      role: UserRole.tailor,
      firstName: 'Ahmed',
      lastName: 'Ali',
      phoneVerified: true,
    },
  });
  await prisma.tailorProfile.upsert({
    where: { userId: tailor1.id },
    update: {},
    create: {
      userId: tailor1.id,
      skillLevel: 'senior',
      specializations: ['full_suit', 'kameez'],
      capacityPerDay: 5,
    },
  });

  const tailor2 = await prisma.user.upsert({
    where: { phone: '+923002222222' },
    update: {},
    create: {
      phone: '+923002222222',
      password: passwordHash,
      role: UserRole.tailor,
      firstName: 'Hassan',
      lastName: 'Khan',
      phoneVerified: true,
    },
  });
  await prisma.tailorProfile.upsert({
    where: { userId: tailor2.id },
    update: {},
    create: {
      userId: tailor2.id,
      skillLevel: 'mid',
      specializations: ['trouser', 'kameez'],
      capacityPerDay: 3,
    },
  });

  const tailor3 = await prisma.user.upsert({
    where: { phone: '+923002222223' },
    update: {},
    create: {
      phone: '+923002222223',
      password: passwordHash,
      role: UserRole.tailor,
      firstName: 'Bilal',
      lastName: 'Raza',
      phoneVerified: true,
    },
  });
  await prisma.tailorProfile.upsert({
    where: { userId: tailor3.id },
    update: {},
    create: {
      userId: tailor3.id,
      skillLevel: 'junior',
      specializations: ['trouser'],
      capacityPerDay: 2,
    },
  });

  console.log('Seeding qc_inspector...');
  await prisma.user.upsert({
    where: { phone: '+923003333333' },
    update: {},
    create: {
      phone: '+923003333333',
      password: passwordHash,
      role: UserRole.qc_inspector,
      firstName: 'Fatima',
      lastName: 'Malik',
      phoneVerified: true,
    },
  });

  console.log('Seeding delivery_agent...');
  await prisma.user.upsert({
    where: { phone: '+923004444444' },
    update: {},
    create: {
      phone: '+923004444444',
      password: passwordHash,
      role: UserRole.delivery_agent,
      firstName: 'Usman',
      lastName: 'Dar',
      phoneVerified: true,
    },
  });

  console.log('Seeding customers...');
  await prisma.user.upsert({
    where: { phone: '+923009999991' },
    update: {},
    create: {
      phone: '+923009999991',
      role: UserRole.customer,
      firstName: 'Sara',
      lastName: 'Aslam',
      phoneVerified: true,
      gender: Gender.female,
    },
  });
  await prisma.user.upsert({
    where: { phone: '+923009999992' },
    update: {},
    create: {
      phone: '+923009999992',
      role: UserRole.customer,
      firstName: 'Nadia',
      lastName: 'Khan',
      phoneVerified: true,
      gender: Gender.female,
    },
  });

  console.log('Seeding System Settings...');
  const settings = [
    { key: 'stitching_base_fee', value: { pkr: 800 }, description: 'Base cost for standard stitching' },
    { key: 'delivery_fee_local', value: { pkr: 150 }, description: 'Local delivery cost' },
    { key: 'delivery_fee_national', value: { pkr: 300 }, description: 'National delivery cost' },
    { key: 'max_cod_amount', value: { pkr: 10000 }, description: 'Maximum amount allowed for COD' },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
        description: setting.description,
      },
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
