// Demo data: sample users, tasks, bids and reviews so the app is demo-ready.
// Run:  npm run seed   (from the project root or from server/)
// Safe to re-run: it removes the previous demo users (and everything they own) first.
import { supabaseAdmin as db } from '../config/supabase.js';

const PASSWORD = 'Demo@1234';

const USERS = [
  { username: 'aarav', name: 'Aarav Sharma', email: 'aarav@seed.extask.app', location: 'Indore',
    bio: 'Product designer. I post tasks when I run out of hours, not ideas.', verified: true, id_details: 'Aadhaar ending 1042' },
  { username: 'priya', name: 'Priya Verma', email: 'priya@seed.extask.app', location: 'Bhopal',
    bio: 'Maths tutor for class 9 to 12. CBSE and MP Board.', verified: true, id_details: 'Aadhaar ending 7731' },
  { username: 'imran', name: 'Imran Qureshi', email: 'imran@seed.extask.app', location: 'Indore',
    bio: 'Electrician for nine years. Wiring, fans, MCBs, inverters.', verified: true, id_details: 'Aadhaar ending 4821' },
  { username: 'kavita', name: 'Kavita Patel', phone: '9876543210', location: 'Ujjain',
    bio: 'Homemaker. Stitching, alterations and tiffin packing.' },
  { username: 'rohan', name: 'Rohan Meena', email: 'rohan@seed.extask.app', location: 'Mandsaur',
    bio: 'B.Tech student, free after 5 pm. Moves boxes, sets up Wi-Fi, fixes laptops.' },
];

const inDays = (n) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
const hoursAgo = (n) => new Date(Date.now() - n * 3_600_000).toISOString();

// hire = username to select; complete = mark finished; reviews = [reviewer, reviewee, rating, comment]
const TASKS = [
  { poster: 'aarav', title: 'Fix a leaking tap in the kitchen', category: 'Plumbing', budget: 400, location: 'Indore', deadline: inDays(2), ago: 2,
    description: 'The kitchen tap drips all night. Probably a worn washer. I will keep the spare parts ready; just need someone who knows what they are doing.',
    bids: [['imran', 350, 'I can come today evening with washers and a spanner.', 'Today, after 6 pm'], ['rohan', 300, 'Free tomorrow after 5 pm. Have fixed two taps before.', 'Tomorrow evening']] },
  { poster: 'priya', title: 'Move a 3-seater sofa and a bed to the 2nd floor', category: 'Moving', budget: 1200, location: 'Bhopal', deadline: inDays(4), ago: 5,
    description: 'Shifting flats within the same building. No lift. Need two people for about two hours. Sofa and a double bed (we will take the bed apart).',
    bids: [['rohan', 1000, 'I can bring a friend. Two people, two hours, done.', 'Saturday morning']] },
  { poster: 'rohan', title: 'Class 10 science tutor for two months, weekends', category: 'Tutoring', budget: 3000, location: 'Mandsaur', deadline: inDays(10), ago: 9,
    description: 'My younger sister needs help with physics and chemistry before the board exams. Two sessions a week, one hour each, at our home.',
    bids: [['priya', 2800, 'Eight years of teaching experience. Can start next weekend.', 'Sat and Sun, 10 to 11 am']] },
  { poster: 'kavita', title: 'Set up a Wi-Fi router and 2 CCTV cameras at my shop', category: 'Tech setup', budget: 1500, location: 'Ujjain', deadline: inDays(6), ago: 14,
    description: 'I have the router and both cameras already. Need them mounted, wired and the phone app set up so I can watch the shop.',
    bids: [['rohan', 1300, 'Done this for two shops already. I will bring my own drill.', 'Any weekday evening'], ['imran', 1600, 'Wiring included. Neat cable clips, no loose wires.', 'This weekend']] },
  { poster: 'aarav', title: 'Paint one bedroom wall (12 x 10 ft), colour already bought', category: 'Painting', budget: 2500, location: 'Indore', deadline: inDays(8), ago: 20,
    description: 'One feature wall. Paint and brushes are with me. The wall needs light sanding and a primer coat first.',
    bids: [['rohan', 2200, 'Painted my own room last year. Can finish in one day.', 'Next Sunday']] },
  { poster: 'imran', title: 'Design a simple logo and visiting card for my electrical shop', category: 'Design', budget: 1500, location: 'Indore', ago: 30, hire: 'aarav',
    description: 'Shop name is Qureshi Electricals. Want a clean logo and a visiting card ready to print.',
    bids: [['aarav', 1200, 'Two logo options and a print-ready card in three days.', 'Starting today'], ['priya', 1400, 'I can ask a designer friend, ready in a week.', 'Next week']] },
  { poster: 'priya', title: 'Stitch four blouses from a sample piece', category: 'Stitching', budget: 1800, location: 'Bhopal', ago: 60, hire: 'kavita', complete: true,
    description: 'I have the fabric and one blouse as a sample. Need four stitched with the same fit.',
    bids: [['kavita', 1600, 'Stitching for 12 years. Fitting included.', 'Ready in five days']],
    reviews: [['priya', 'kavita', 5, 'Perfect fit on all four, delivered a day early.'], ['kavita', 'priya', 5, 'Clear instructions and paid on time.']] },
  { poster: 'aarav', title: 'Install a ceiling fan and two tube lights', category: 'Electrical', budget: 600, location: 'Indore', ago: 90, hire: 'imran', complete: true,
    description: 'Fan, rod and tube lights are bought. Need installation and a quick check of the switchboard.',
    bids: [['imran', 550, 'Takes about an hour. I carry my own tester.', 'Tomorrow morning']],
    reviews: [['aarav', 'imran', 5, 'Quick, tidy and explained what he checked.'], ['imran', 'aarav', 4, 'Good host, task as described.']] },
];

const must = ({ data, error }, what) => {
  if (error) throw new Error(`${what}: ${error.message}`);
  return data;
};

async function cleanup() {
  // Remove any earlier demo accounts. Deleting an auth user cascades to its profile, tasks, bids and reviews.
  const usernames = USERS.map((u) => u.username);
  const profiles = must(await db.from('profiles').select('id').in('username', usernames), 'find old profiles');
  const ids = new Set(profiles.map((p) => p.id));

  // Also catch half-created auth users from an interrupted earlier run.
  const { data: list } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const demoEmails = new Set(USERS.map((u) => u.email || `91${u.phone}@phone.extask.app`));
  for (const u of list?.users ?? []) if (demoEmails.has(u.email)) ids.add(u.id);

  for (const id of ids) await db.auth.admin.deleteUser(id);
  if (ids.size) console.log(`Removed ${ids.size} old demo user(s)`);
}

async function main() {
  await cleanup();

  const idOf = {};
  for (const u of USERS) {
    const authEmail = u.email || `91${u.phone}@phone.extask.app`;
    const { data, error } = await db.auth.admin.createUser({ email: authEmail, password: PASSWORD, email_confirm: true });
    if (error) throw new Error(`createUser ${u.username}: ${error.message}`);
    must(
      await db.from('profiles').insert({
        id: data.user.id, name: u.name, username: u.username, email: u.email ?? null, phone: u.phone ?? null,
        auth_email: authEmail, location: u.location, bio: u.bio, id_details: u.id_details ?? null, id_verified: Boolean(u.verified),
      }),
      `profile ${u.username}`
    );
    idOf[u.username] = data.user.id;
  }
  console.log(`Created ${USERS.length} users`);

  let bidCount = 0;
  for (const t of TASKS) {
    const task = must(
      await db.from('tasks').insert({
        poster_id: idOf[t.poster], title: t.title, description: t.description, category: t.category,
        budget: t.budget, location: t.location, deadline: t.deadline ?? null, created_at: hoursAgo(t.ago),
      }).select().single(),
      `task "${t.title}"`
    );

    const bidIds = {};
    for (const [bidder, amount, message, availability] of t.bids) {
      const bid = must(
        await db.from('bids').insert({ task_id: task.id, bidder_id: idOf[bidder], amount, message, availability }).select().single(),
        'bid'
      );
      bidIds[bidder] = bid.id;
      bidCount += 1;
    }

    if (t.hire) {
      // Same atomic function the API uses.
      must(await db.rpc('select_bid', { p_task_id: task.id, p_bid_id: bidIds[t.hire], p_poster_id: idOf[t.poster] }), 'select_bid');
    }
    if (t.complete) {
      must(await db.from('tasks').update({ status: 'completed' }).eq('id', task.id), 'complete task');
    }
    for (const [reviewer, reviewee, rating, comment] of t.reviews ?? []) {
      must(await db.from('reviews').insert({ task_id: task.id, reviewer_id: idOf[reviewer], reviewee_id: idOf[reviewee], rating, comment }), 'review');
    }
  }
  console.log(`Created ${TASKS.length} tasks and ${bidCount} bids`);

  console.log('\nDemo logins (password for all: ' + PASSWORD + ')');
  for (const u of USERS) console.log(`  ${u.username.padEnd(8)} login with: ${u.username}${u.phone ? `  or phone ${u.phone}` : `  or ${u.email}`}`);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
