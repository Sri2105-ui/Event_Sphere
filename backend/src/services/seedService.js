import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { Certificate } from '../models/Certificate.js';
import { Notification } from '../models/Notification.js';
import { Payment } from '../models/Payment.js';
import { generateTicketQR } from './qrService.js';

let isSeedingInProgress = false;

export const seedDatabase = async ({ force = false } = {}) => {
  if (isSeedingInProgress) {
    console.log('[SeedService]: Seeding already in progress, skipping duplicate call.');
    return { success: true, message: 'Seeding already in progress' };
  }

  isSeedingInProgress = true;
  try {
    const existingEventsCount = await Event.countDocuments();
    if (!force && existingEventsCount > 0) {
      console.log(`[SeedService]: Database already contains ${existingEventsCount} events. Skipping seed.`);
      return { success: true, seeded: false, count: existingEventsCount };
    }

    console.log('[SeedService]: Initializing database seed routine...');

    if (force) {
      console.log('[SeedService]: Force mode enabled. Clearing existing collections...');
      await Promise.all([
        User.deleteMany({}),
        Category.deleteMany({}),
        Event.deleteMany({}),
        Registration.deleteMany({}),
        Certificate.deleteMany({}),
        Notification.deleteMany({}),
        Payment.deleteMany({})
      ]);
    }

    // 1. Ensure or Create Demo Users
    const usersMap = {};

    const demoUsers = [
      {
        key: 'admin',
        email: 'admin@eventsphere.com',
        name: 'Dr. Evelyn Reed',
        password: 'admin123',
        role: 'admin',
        organization: 'University Academic Senate',
        phone: '+1 (555) 019-2831',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        bio: 'Dean of Student Activities & Event Board Administrator'
      },
      {
        key: 'organizer1',
        email: 'organizer@eventsphere.com',
        name: 'Alex Vance',
        password: 'organizer123',
        role: 'organizer',
        organization: 'Campus Tech & Innovation Club',
        phone: '+1 (555) 432-8765',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        bio: 'Lead organizer for HackSphere, Developer Circles, and campus coding camps.'
      },
      {
        key: 'organizer2',
        email: 'cultural@campus.edu',
        name: 'Priya Sharma',
        password: 'organizer123',
        role: 'organizer',
        organization: 'University Arts & Cultural Council',
        phone: '+1 (555) 765-4321',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
        bio: 'Coordinator for annual inter-college festivals, music galas, and art exhibitions.'
      },
      {
        key: 'student1',
        email: 'student@eventsphere.com',
        name: 'Jordan Lee',
        password: 'student123',
        role: 'participant',
        organization: 'Computer Science Dept, 3rd Year',
        phone: '+1 (555) 987-6543',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        bio: 'Full-stack enthusiast, hackathon addict, and ML researcher.'
      },
      {
        key: 'student2',
        email: 'sophia@campus.edu',
        name: 'Sophia Chen',
        password: 'student123',
        role: 'participant',
        organization: 'Design & Media Arts',
        phone: '+1 (555) 345-6789',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        bio: 'Product designer and frontend tinkerer.'
      },
      {
        key: 'student3',
        email: 'marcus@campus.edu',
        name: 'Marcus Brody',
        password: 'student123',
        role: 'participant',
        organization: 'Electrical & Robotics Engineering',
        phone: '+1 (555) 876-5432',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        bio: 'Hardware hacker and autonomous systems builder.'
      }
    ];

    for (const u of demoUsers) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create({
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          organization: u.organization,
          phone: u.phone,
          avatar: u.avatar,
          bio: u.bio
        });
      }
      usersMap[u.key] = user;
    }

    // 2. Ensure or Create Categories
    const categoriesMap = {};
    const defaultCategories = [
      {
        name: 'Hackathons',
        slug: 'hackathons',
        icon: 'code',
        description: 'Intensive 24-48 hour competitive problem solving and prototype building sprints.',
        color: '#6366F1',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Tech Workshops',
        slug: 'tech-workshops',
        icon: 'cpu',
        description: 'Hands-on guided skill-building labs in Web3, AI/ML, Cloud, and Cybersecurity.',
        color: '#0EA5E9',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Seminars & Talks',
        slug: 'seminars-talks',
        icon: 'mic',
        description: 'Keynotes, fireside chats, and expert panels with top industry pioneers.',
        color: '#8B5CF6',
        image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Cultural Fests',
        slug: 'cultural-fests',
        icon: 'music',
        description: 'Vibrant college fests featuring live musical concerts, dance battles, and theatre.',
        color: '#EC4899',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Coding Competitions',
        slug: 'coding-competitions',
        icon: 'terminal',
        description: 'Algorithmic arenas, CTF cybersecurity challenges, and competitive programming.',
        color: '#F59E0B',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Academic Conferences',
        slug: 'academic-conferences',
        icon: 'book-open',
        description: 'Peer-reviewed research paper presentations, poster sessions, and symposiums.',
        color: '#10B981',
        image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&q=80'
      }
    ];

    for (const catData of defaultCategories) {
      let cat = await Category.findOne({ slug: catData.slug });
      if (!cat) {
        cat = await Category.create(catData);
      }
      categoriesMap[catData.slug] = cat;
    }

    // 3. Create Featured & Upcoming Events with relative dates
    const adminUser = usersMap.admin;
    const organizer1 = usersMap.organizer1;
    const organizer2 = usersMap.organizer2;
    const student1 = usersMap.student1;
    const student2 = usersMap.student2;

    const event1 = await Event.create({
      title: 'HackSphere 2026: 36-Hour National Collegiate Hackathon',
      slug: `hacksphere-2026-${Date.now().toString(36)}`,
      shortDescription: 'Build next-gen solutions in AI, Healthcare, Climate, and Fintech with $15,000 in prizes!',
      description: `
Welcome to **HackSphere 2026**, the largest inter-collegiate hackathon in the region! Over 36 exhilarating hours, 500+ student developers, designers, and innovators will collaborate to tackle real-world problems.

### Tracks
- **AI & Autonomous Agents**: Build with LLMs, generative media, and computer vision.
- **Fintech & Decentralized Ledger**: Modern payment rails, micro-finance, and security.
- **Green Tech & Climate Resilience**: Smart grids, waste tracking, and eco-analytics.
- **Open Innovation**: Wildcard problems solving student life and education.

### Perks for Attendees
- Mentorship from engineers at top tech companies.
- Unlimited high-speed Wi-Fi, refreshments, meals, and midnight snacks.
- Official HackSphere hoodie, swag kit, and hardware lab access.
      `,
      category: categoriesMap['hackathons']._id,
      organizer: organizer1._id,
      eventType: 'hackathon',
      venueType: 'in-person',
      venueName: 'Innovation Hub, East Campus Quad',
      address: '742 Innovation Drive, University Campus',
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      capacity: 350,
      registeredCount: 0,
      price: 15,
      currency: 'USD',
      bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
      tags: ['Hackathon', 'AI', 'Coding', 'Prizes', 'Team Competition'],
      featured: true,
      status: 'published',
      agenda: [
        { time: 'Day 1 - 09:00 AM', title: 'Check-in & Swag Collection', speaker: 'Event Volunteers' },
        { time: 'Day 1 - 10:30 AM', title: 'Opening Keynote & Track Reveal', speaker: 'Alex Vance (Tech Club)' },
        { time: 'Day 1 - 12:00 PM', title: 'Hacking Kickoff & Team Formation', speaker: 'All Hackers' },
        { time: 'Day 2 - 08:00 PM', title: 'Hacking Stops & Project Submissions', speaker: 'Judges' },
        { time: 'Day 2 - 09:30 PM', title: 'Final Demos & Awards Gala', speaker: 'VIP Panel' }
      ],
      certificateTemplate: {
        title: 'Certificate of Excellence & Innovation',
        issuerName: 'Campus Innovation Council',
        issuerRole: 'Chief Hackathon Director',
        templateStyle: 'gold'
      }
    });

    const event2 = await Event.create({
      title: 'Modern Full-Stack AI & Cloud Architecture Masterclass',
      slug: `modern-full-stack-ai-cloud-${Date.now().toString(36)}`,
      shortDescription: 'Deep dive into building scalable cloud apps powered by vector databases and modern LLM APIs.',
      description: `
Join Senior Cloud Architects for an intensive, hands-on workshop on building production-grade web applications with React, Node.js, vector embeddings, and serverless infrastructure.

### What You Will Learn
- Setting up vector pipelines with hybrid search.
- Integrating streaming AI endpoints with WebSockets.
- Microservices, caching with Redis, and zero-downtime deployment.
- Hands-on coding exercises with real repository templates.
      `,
      category: categoriesMap['tech-workshops']._id,
      organizer: organizer1._id,
      eventType: 'workshop',
      venueType: 'hybrid',
      venueName: 'Turing Lecture Auditorium / Zoom Live',
      address: 'Science Hall 302',
      meetingLink: 'https://zoom.us/j/eventsphere-ai-cloud-demo',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      capacity: 150,
      registeredCount: 0,
      price: 0,
      currency: 'USD',
      bannerImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      tags: ['Cloud', 'Full-Stack', 'AI', 'NodeJS', 'React', 'Free'],
      featured: true,
      status: 'published',
      agenda: [
        { time: '02:00 PM', title: 'System Architecture Fundamentals', speaker: 'Dev Lead Sarah' },
        { time: '03:15 PM', title: 'Vector Embeddings & Retrieval Lab', speaker: 'AI Researcher Dr. Mark' },
        { time: '04:45 PM', title: 'Live Deployment & Q&A', speaker: 'Cloud Specialist' }
      ]
    });

    const event3 = await Event.create({
      title: 'Rhythm & Echoes: Inter-College Cultural Gala 2026',
      slug: `rhythm-and-echoes-gala-${Date.now().toString(36)}`,
      shortDescription: 'The biggest night of music, theatrical drama, and inter-university dance competitions.',
      description: `
Experience the rhythm and magic of **Rhythm & Echoes 2026**! Featuring 20+ college bands, solo acoustic performers, dramatic performances, and an explosive EDM after-party.
Food trucks, artisan stalls, and photo booths will line the main festival grounds.
      `,
      category: categoriesMap['cultural-fests']._id,
      organizer: organizer2._id,
      eventType: 'cultural',
      venueType: 'in-person',
      venueName: 'Open Air Amphitheatre',
      address: 'University Lakefront Grounds',
      startDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
      capacity: 800,
      registeredCount: 0,
      price: 10,
      currency: 'USD',
      bannerImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      tags: ['Music', 'Concert', 'Dance', 'Festival', 'Campus Life'],
      featured: true,
      status: 'published',
      agenda: [
        { time: '05:00 PM', title: 'Gates Open & Street Performances', speaker: 'Festival Crew' },
        { time: '06:30 PM', title: 'Battle of the Campus Bands', speaker: '12 College Bands' },
        { time: '09:00 PM', title: 'Headline Celebrity Act & Light Show', speaker: 'Special Guest DJ' }
      ]
    });

    const event4 = await Event.create({
      title: 'Quantum Computing & Applied Cryptography Seminar',
      slug: `quantum-cryptography-seminar-${Date.now().toString(36)}`,
      shortDescription: 'Explore post-quantum cryptography algorithms, qubit architectures, and cybersecurity frontiers.',
      description: `
How will quantum computers disrupt current public key encryption? In this seminar, leading quantum researchers break down lattice-based cryptography, quantum key distribution (QKD), and practical quantum simulators.
      `,
      category: categoriesMap['seminars-talks']._id,
      organizer: organizer1._id,
      eventType: 'seminar',
      venueType: 'in-person',
      venueName: 'Main Science Auditorium Room A',
      address: 'Center for Advanced Research',
      startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      capacity: 120,
      registeredCount: 0,
      price: 0,
      currency: 'USD',
      bannerImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
      tags: ['Quantum', 'Cryptography', 'Security', 'Seminar', 'Math'],
      featured: false,
      status: 'published'
    });

    const event5 = await Event.create({
      title: 'SpeedCode Showdown: Algorithmic Duel Championship',
      slug: `speedcode-showdown-${Date.now().toString(36)}`,
      shortDescription: '1v1 speed coding battles on data structures and dynamic programming. Winner takes all!',
      description: `
Compete against top collegiate algorithmic coders in a knockout bracket! Real-time code execution, anti-cheat monitoring, and live spectators.
Languages supported: C++, Python, Java, JavaScript, Rust.
      `,
      category: categoriesMap['coding-competitions']._id,
      organizer: organizer1._id,
      eventType: 'competition',
      venueType: 'online',
      venueName: 'EventSphere Online Code Arena',
      address: 'Virtual Event',
      startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      capacity: 250,
      registeredCount: 0,
      price: 5,
      currency: 'USD',
      bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      tags: ['Algorithms', 'LeetCode', 'Competitive Programming', 'Prizes'],
      featured: true,
      status: 'published'
    });

    const event6 = await Event.create({
      title: 'Annual International Student AI Research Symposium',
      slug: `student-ai-research-symposium-${Date.now().toString(36)}`,
      shortDescription: 'Presentations of published student research in LLMs, robotics, neural rendering, and bio-informatics.',
      description: `
A prestigious academic symposium bringing together undergraduate and graduate researchers. Features peer-reviewed paper presentations, poster sessions, and keynote talks from university professors.
      `,
      category: categoriesMap['academic-conferences']._id,
      organizer: adminUser._id,
      eventType: 'conference',
      venueType: 'in-person',
      venueName: 'Grand Conference Center, North Hall',
      address: 'University Boulevard',
      startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
      capacity: 300,
      registeredCount: 0,
      price: 35,
      currency: 'USD',
      bannerImage: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1200&q=80',
      tags: ['Research', 'Conference', 'AI', 'Papers', 'Academia'],
      featured: false,
      status: 'published'
    });

    const eventCompleted = await Event.create({
      title: 'DesignSphere: UI/UX & Product Design Intensive',
      slug: `designsphere-ui-ux-${Date.now().toString(36)}`,
      shortDescription: 'Design thinking, Figma design systems, accessibility, and high-fidelity interactive prototyping.',
      description: `
A comprehensive 2-day intensive where 100+ students built complete responsive design systems in Figma and converted designs into production-ready frontends.
      `,
      category: categoriesMap['tech-workshops']._id,
      organizer: organizer1._id,
      eventType: 'workshop',
      venueType: 'online',
      venueName: 'Figma Live Classroom',
      address: 'Online',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      capacity: 150,
      registeredCount: 0,
      price: 0,
      currency: 'USD',
      bannerImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
      tags: ['UI/UX', 'Figma', 'Product', 'Design'],
      featured: false,
      status: 'completed',
      averageRating: 4.8,
      totalReviews: 2
    });

    // 4. Create sample registrations and QR tickets
    try {
      const reg1Num = `ESP-HACK-${Date.now().toString(36).toUpperCase()}`;
      const qr1 = await generateTicketQR({
        registrationId: new mongoose.Types.ObjectId(),
        eventId: event1._id,
        userId: student1._id,
        userName: student1.name,
        eventTitle: event1.title,
        registrationNumber: reg1Num
      });

      const reg1 = await Registration.create({
        event: event1._id,
        user: student1._id,
        registrationNumber: reg1Num,
        status: 'confirmed',
        paymentStatus: 'paid',
        amountPaid: 15,
        currency: 'USD',
        paymentMethod: 'card',
        transactionId: `TXN-HACK-${Date.now().toString(36).toUpperCase()}`,
        ticketHash: qr1.hash,
        ticketQrData: qr1.qrDataUrl,
        attendanceStatus: 'registered'
      });
      event1.registeredCount += 1;
      await event1.save();

      await Payment.create({
        user: student1._id,
        event: event1._id,
        registration: reg1._id,
        amount: 15,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'card',
        transactionId: reg1.transactionId
      });

      // Sample verified certificate
      const certCode = `ESP-${Date.now().toString(36).toUpperCase()}`;
      await Certificate.create({
        event: eventCompleted._id,
        user: student1._id,
        registration: reg1._id,
        certificateNumber: `CERT-${Date.now().toString(36).toUpperCase()}`,
        verificationCode: certCode,
        title: 'Certificate of UI/UX Mastery & Interactive Design',
        recipientName: student1.name,
        eventName: eventCompleted.title,
        eventDate: eventCompleted.startDate,
        issuerName: 'Campus Design Guild',
        issuerRole: 'Head of Product Design',
        templateStyle: 'gold',
        issuedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      });
    } catch (qrErr) {
      console.warn('[SeedService]: QR or registration creation warning:', qrErr.message);
    }

    const finalEventsCount = await Event.countDocuments();
    console.log(`[SeedService]: Seeding completed successfully! Total events: ${finalEventsCount}`);

    return {
      success: true,
      seeded: true,
      eventsCount: finalEventsCount,
      categoriesCount: Object.keys(categoriesMap).length
    };
  } catch (error) {
    console.error('[SeedService Error]:', error);
    throw error;
  } finally {
    isSeedingInProgress = false;
  }
};

export const autoSeedIfEmpty = async () => {
  try {
    const count = await Event.countDocuments();
    if (count === 0) {
      console.log('[Auto-Seed]: No events found in database. Automatically seeding default campus events...');
      await seedDatabase({ force: false });
    }
  } catch (error) {
    console.warn('[Auto-Seed Warning]: Auto-seed attempt could not complete:', error.message);
  }
};
