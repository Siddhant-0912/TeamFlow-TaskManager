async function main() {
  process.env.SKIP_AUTO_SEED = 'true';

  const { default: connectDB } = await import('../src/lib/mongodb');
  const { seedDemoData } = await import('../src/lib/seed/seedDemoData');

  await connectDB();
  const result = await seedDemoData({ reset: process.argv.includes('--reset') });
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
