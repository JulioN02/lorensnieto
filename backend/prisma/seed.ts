import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ============================================
  // CREAR USUARIOS
  // ============================================

  const adminPassword = await bcrypt.hash('admin123', 12);
  const partnerPassword = await bcrypt.hash('partner123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'lorena@lorensnieto.com' },
    update: {},
    create: {
      email: 'lorena@lorensnieto.com',
      password: adminPassword,
      role: 'admin',
      name: 'Lorena Cecilia Nieto Diaz',
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);

  const partner = await prisma.user.upsert({
    where: { email: 'julio@jsoftsolutions.com' },
    update: {},
    create: {
      email: 'julio@jsoftsolutions.com',
      password: partnerPassword,
      role: 'partner',
      name: 'Julio Manuel Nieto Martínez',
    },
  });

  console.log(`✅ Partner created: ${partner.email}`);

  // ============================================
  // CREAR CONFIGURACIÓN
  // ============================================

  const settings = await prisma.settings.upsert({
    where: { id: 'global-settings' },
    update: {},
    create: {
      id: 'global-settings',
      commissionPct: 0.1, // 10%
      partnerDeadlineDays: 5,
      notificationEmail: 'lorensnieto25@gmail.com',
      rulesDocUrl: '',
    },
  });

  console.log(`✅ Settings created`);

  // ============================================
  // CREAR PERÍODO ACTUAL DEL SOCIO TÉCNICO
  // ============================================

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const deadline = new Date(now.getFullYear(), now.getMonth() + 1, settings.partnerDeadlineDays);

  const period = await prisma.partnerPeriod.upsert({
    where: { month: currentMonth },
    update: {},
    create: {
      month: currentMonth,
      revenueTotal: 0,
      phase: 'fase_1',
      pctApplied: 0.09,
      amountDue: 0,
      amountPaid: 0,
      status: 'pendiente',
      deadlineDate: deadline,
    },
  });

  console.log(`✅ Partner period created: ${period.month}`);

  console.log('\n🎉 Seed completado!');
  console.log('\n📋 Credenciales de prueba:');
  console.log('   Admin:   lorena@lorensnieto.com / admin123');
  console.log('   Partner: julio@jsoftsolutions.com / partner123');
  console.log('\n⚠️  CAMBIAR CONTRASEÑAS EN PRODUCCIÓN\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
