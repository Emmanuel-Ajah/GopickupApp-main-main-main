// Local-only persistent MongoDB. Does not read production .env settings.
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
(async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const directory = path.join(__dirname, '../.local-data');
  fs.mkdirSync(directory, { recursive: true });
  const database = await MongoMemoryServer.create({ instance: { launchTimeout: 60000, dbPath: directory, storageEngine: 'wiredTiger' } });
  process.env.GOPICKUP_LOCAL = '1';
  process.env.MONGODB_URI = database.getUri('gopickup_local');
  process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
  process.env.NODE_ENV = 'development';
  process.env.PORT = '5050';
  require('../server');
  const User = require('../models/User');
  const password = 'LocalDemo123!';
  for (const role of ['admin', 'user']) {
    const email = `${role}@gopickup.test`;
    let user = await User.findOne({ email });
    if (!user) await User.create({ name: `Local ${role}`, email, password, role, userId: `LOCAL-${role}` });
  }
  console.log('Local accounts: admin@gopickup.test / user@gopickup.test — password: LocalDemo123!');
  for (const signal of ['SIGINT','SIGTERM']) process.on(signal, async () => { await database.stop(); process.exit(0); });
})().catch(error => { console.error(error); process.exit(1); });
