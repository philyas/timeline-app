/**
 * Debug: Check important events in database
 */
require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'timeline_app',
    user: process.env.DB_USER || 'timeline_user',
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('Connected to database.\n');

    // Check all events with is_important flag
    const eventsRes = await client.query(`
      SELECT e.id, e.title, e.is_important, e.timeline_id, t.name as timeline_name, t.user_id
      FROM events e
      LEFT JOIN timelines t ON e.timeline_id = t.id
      ORDER BY e.id
    `);
    
    console.log('=== ALL EVENTS ===');
    console.log(`Total: ${eventsRes.rows.length} events\n`);
    
    for (const row of eventsRes.rows) {
      const important = row.is_important ? '★ WICHTIG' : '  normal';
      console.log(`[${important}] Event #${row.id}: "${row.title}" | Timeline: ${row.timeline_name} (id=${row.timeline_id}, user=${row.user_id})`);
    }

    // Count important events
    const importantRes = await client.query(`SELECT COUNT(*) as cnt FROM events WHERE is_important = true`);
    console.log(`\n=== SUMMARY ===`);
    console.log(`Important events: ${importantRes.rows[0].cnt}`);

    // Show users
    const usersRes = await client.query(`SELECT id, email FROM users`);
    console.log(`\nUsers in system:`);
    for (const u of usersRes.rows) {
      console.log(`  User #${u.id}: ${u.email}`);
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
