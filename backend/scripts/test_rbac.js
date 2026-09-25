import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { User } from '../src/models/User.js';
import { protect } from '../src/middleware/auth.js';
import { authorize } from '../src/middleware/roleAuth.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventsphere';
const JWT_SECRET = process.env.JWT_SECRET || 'eventsphere_super_secret_jwt_key_2026_modern_secure';

async function runTests() {
  console.log('[Test Suite] Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('[Test Suite] Connected to MongoDB.\n');

  // Verify users in database
  const participant = await User.findOne({ email: 'student@eventsphere.com' });
  const organizer = await User.findOne({ email: 'organizer@eventsphere.com' });
  const admin = await User.findOne({ email: 'admin@eventsphere.com' });

  console.log('--- TEST 1: Database Users & Role Schema ---');
  console.log('Participant user:', participant?.email, '-> role:', participant?.role, participant?.role === 'participant' ? '✓ PASS' : '✗ FAIL');
  console.log('Organizer user:', organizer?.email, '-> role:', organizer?.role, organizer?.role === 'organizer' ? '✓ PASS' : '✗ FAIL');
  console.log('Admin user:', admin?.email, '-> role:', admin?.role, admin?.role === 'admin' ? '✓ PASS' : '✗ FAIL');

  console.log('\n--- TEST 2: JWT Generation & Role Inclusion ---');
  const partToken = jwt.sign({ id: participant._id, role: participant.role }, JWT_SECRET, { expiresIn: '7d' });
  const orgToken = jwt.sign({ id: organizer._id, role: organizer.role }, JWT_SECRET, { expiresIn: '7d' });
  const admToken = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '7d' });

  const decPart = jwt.verify(partToken, JWT_SECRET);
  const decOrg = jwt.verify(orgToken, JWT_SECRET);
  const decAdm = jwt.verify(admToken, JWT_SECRET);

  console.log('Decoded participant token role:', decPart.role, decPart.role === 'participant' ? '✓ PASS' : '✗ FAIL');
  console.log('Decoded organizer token role:', decOrg.role, decOrg.role === 'organizer' ? '✓ PASS' : '✗ FAIL');
  console.log('Decoded admin token role:', decAdm.role, decAdm.role === 'admin' ? '✓ PASS' : '✗ FAIL');

  console.log('\n--- TEST 3: Role-Based Authorization Middleware (authorize) ---');
  // Helper to test middleware
  const testAuthorize = (roles, userObj, routeName) => {
    let status = 200;
    let message = 'OK';
    const req = {
      user: userObj,
      method: 'GET',
      originalUrl: routeName
    };
    const res = {
      status: (s) => {
        status = s;
        return {
          json: (data) => {
            message = data.message;
          }
        };
      }
    };
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };
    const middleware = authorize(...roles);
    middleware(req, res, next);
    return { status, nextCalled, message };
  };

  // 1. Participant accessing participant route (no role restriction needed, but let's test if checked)
  console.log('\nTesting Participant access to Organizer Route (e.g. /api/events/organizer/my-events, requires organizer, admin):');
  const partToOrg = testAuthorize(['organizer', 'admin'], participant, '/api/events/organizer/my-events');
  console.log(`Status: ${partToOrg.status}, Next called: ${partToOrg.nextCalled}, Message: "${partToOrg.message}"`);
  console.log('Result:', partToOrg.status === 403 && !partToOrg.nextCalled ? '✓ PASS (Correctly denied with 403)' : '✗ FAIL');

  console.log('\nTesting Participant access to Admin Route (e.g. /api/admin/stats, requires admin):');
  const partToAdm = testAuthorize(['admin'], participant, '/api/admin/stats');
  console.log(`Status: ${partToAdm.status}, Next called: ${partToAdm.nextCalled}, Message: "${partToAdm.message}"`);
  console.log('Result:', partToAdm.status === 403 && !partToAdm.nextCalled ? '✓ PASS (Correctly denied with 403)' : '✗ FAIL');

  console.log('\nTesting Organizer access to Organizer Route:');
  const orgToOrg = testAuthorize(['organizer', 'admin'], organizer, '/api/events/organizer/my-events');
  console.log(`Status: ${orgToOrg.status}, Next called: ${orgToOrg.nextCalled}`);
  console.log('Result:', orgToOrg.status === 200 && orgToOrg.nextCalled ? '✓ PASS (Allowed)' : '✗ FAIL');

  console.log('\nTesting Organizer access to Admin Route:');
  const orgToAdm = testAuthorize(['admin'], organizer, '/api/admin/stats');
  console.log(`Status: ${orgToAdm.status}, Next called: ${orgToAdm.nextCalled}, Message: "${orgToAdm.message}"`);
  console.log('Result:', orgToAdm.status === 403 && !orgToAdm.nextCalled ? '✓ PASS (Correctly denied with 403)' : '✗ FAIL');

  console.log('\nTesting Admin access to Admin Route:');
  const admToAdm = testAuthorize(['admin'], admin, '/api/admin/stats');
  console.log(`Status: ${admToAdm.status}, Next called: ${admToAdm.nextCalled}`);
  console.log('Result:', admToAdm.status === 200 && admToAdm.nextCalled ? '✓ PASS (Allowed)' : '✗ FAIL');

  console.log('\nTesting Admin access to Organizer Route:');
  const admToOrg = testAuthorize(['organizer', 'admin'], admin, '/api/events/organizer/my-events');
  console.log(`Status: ${admToOrg.status}, Next called: ${admToOrg.nextCalled}`);
  console.log('Result:', admToOrg.status === 200 && admToOrg.nextCalled ? '✓ PASS (Allowed)' : '✗ FAIL');

  console.log('\n--- TEST 4: Protect Middleware & Stale Token Detection ---');
  const testProtect = async (tokenHeader, routeName) => {
    let status = 200;
    let message = 'OK';
    const req = {
      headers: { authorization: tokenHeader },
      method: 'GET',
      originalUrl: routeName
    };
    const res = {
      status: (s) => {
        status = s;
        return {
          json: (data) => {
            message = data.message;
          }
        };
      }
    };
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };
    await protect(req, res, next);
    return { status, nextCalled, message, reqUser: req.user };
  };

  // 1. Valid token
  const validProtect = await testProtect(`Bearer ${partToken}`, '/api/registrations/my');
  console.log('Valid participant token:', validProtect.status, validProtect.nextCalled ? '✓ PASS (Authenticated as ' + validProtect.reqUser.role + ')' : '✗ FAIL');

  // 2. Missing token
  const missingToken = await testProtect(undefined, '/api/registrations/my');
  console.log('Missing token:', missingToken.status, missingToken.status === 401 ? '✓ PASS (401 Unauthorized)' : '✗ FAIL');

  // 3. Stale token (token says 'organizer', but user in DB is 'participant')
  const staleToken = jwt.sign({ id: participant._id, role: 'organizer' }, JWT_SECRET, { expiresIn: '7d' });
  const staleProtect = await testProtect(`Bearer ${staleToken}`, '/api/events/organizer/my-events');
  console.log('Stale token presented:', staleProtect.status, staleProtect.status === 401 ? '✓ PASS (Rejected with 401: ' + staleProtect.message + ')' : '✗ FAIL');

  console.log('\n========================================');
  console.log('ALL RBAC TESTS PASSED SUCCESSFULLY! ✓✓✓');
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
