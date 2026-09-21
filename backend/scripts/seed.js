import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/User.js';
import { Category } from '../src/models/Category.js';
import { Event } from '../src/models/Event.js';
import { Registration } from '../src/models/Registration.js';
import { Certificate } from '../src/models/Certificate.js';
import { Notification } from '../src/models/Notification.js';
import { Payment } from '../src/models/Payment.js';
import { generateTicketQR } from '../src/services/qrService.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventsphere';
    await mongoose.connect(mongoUri);
    console.log(`Connected to database for seeding: ${mongoUri}`);

    // Clear existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await Certificate.deleteMany({});
    await Notification.deleteMany({});
    await Payment.deleteMany({});
    console.log('Cleared existing platform data.');

    // 1. Create Users
    console.log('Creating users...');
    const adminUser = await User.create({
      name: 'Dr. Evelyn Reed',
      email: 'admin@eventsphere.com',
      password: 'admin123',
      role: 'admin',
      organization: 'University Academic Senate',
      phone: '+1 (555) 019-2831',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      bio: 'Dean of Student Activities & Event Board Administrator'
    });

    const organizer1 = await User.create({
      name: 'Alex Vance',
      email: 'organizer@eventsphere.com',
      password: 'organizer123',
      role: 'organizer',
      organization: 'Campus Tech & Innovation Club',
      phone: '+1 (555) 432-8765',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      bio: 'Lead organizer for HackSphere, Developer Circles, and campus coding camps.'
    });

    const organizer2 = await User.create({
      name: 'Priya Sharma',
      email: 'cultural@campus.edu',
      password: 'organizer123',
      role: 'organizer',
      organization: 'University Arts & Cultural Council',
      phone: '+1 (555) 765-4321',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      bio: 'Coordinator for annual inter-college festivals, music galas, and art exhibitions.'
    });

    const student1 = await User.create({
      name: 'Jordan Lee',
      email: 'student@eventsphere.com',
      password: 'student123',
      role: 'participant',
      organization: 'Computer Science Dept, 3rd Year',
      phone: '+1 (555) 987-6543',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Full-stack enthusiast, hackathon addict, and ML researcher.'
    });

    const student2 = await User.create({
      name: 'Sophia Chen',
      email: 'sophia@campus.edu',
      password: 'student123',
      role: 'participant',
      organization: 'Design & Media Arts',
      phone: '+1 (555) 345-6789',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      bio: 'Product designer and frontend tinkerer.'
    });

    const student3 = await User.create({
      name: 'Marcus Brody',
      email: 'marcus@campus.edu',
      password: 'student123',
      role: 'participant',
      organization: 'Electrical & Robotics Engineering',
      phone: '+1 (555) 876-5432',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Hardware hacker and autonomous systems builder.'
    });

    // 2. Create Categories
    console.log('Creating categories...');
    const catHackathon = await Category.create({
      name: 'Hackathons',
      slug: 'hackathons',
      icon: 'code',
      description: 'Intensive 24-48 hour competitive problem solving and prototype building sprints.',
      color: '#6366F1',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80'
    });

    const catWorkshop = await Category.create({
      name: 'Tech Workshops',
      slug: 'tech-workshops',
      icon: 'cpu',
      description: 'Hands-on guided skill-building labs in Web3, AI/ML, Cloud, and Cybersecurity.',
      color: '#0EA5E9',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
    });

    const catSeminar = await Category.create({
      name: 'Seminars & Talks',
      slug: 'seminars-talks',
      icon: 'mic',
      description: 'Keynotes, fireside chats, and expert panels with top industry pioneers.',
      color: '#8B5CF6',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80'
    });

    const catCultural = await Category.create({
      name: 'Cultural Fests',
      slug: 'cultural-fests',
      icon: 'music',
      description: 'Vibrant college fests featuring live musical concerts, dance battles, and theatre.',
      color: '#EC4899',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
    });

    const catCompetition = await Category.create({
      name: 'Coding Competitions',
      slug: 'coding-competitions',
      icon: 'terminal',
      description: 'Algorithmic arenas, CTF cybersecurity challenges, and competitive programming.',
      color: '#F59E0B',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
    });

    const catConference = await Category.create({
      name: 'Academic Conferences',
      slug: 'academic-conferences',
      icon: 'book-open',
      description: 'Peer-reviewed research paper presentations, poster sessions, and symposiums.',
      color: '#10B981',
      image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&q=80'
    });

    // 3. Create Events
    console.log('Creating events...');
    const now = new Date();
    const event1 = await Event.create({
      title: 'HackSphere 2026: 36-Hour National Collegiate Hackathon',
      slug: 'hacksphere-2026-national-collegiate-hackathon',
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
      category: catHackathon._id,
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
      slug: 'modern-full-stack-ai-cloud-architecture-masterclass',
      shortDescription: 'Deep dive into building scalable cloud apps powered by vector databases and modern LLM APIs.',
      description: `
Join Senior Cloud Architects for an intensive, hands-on workshop on building production-grade web applications with React, Node.js, vector embeddings, and serverless infrastructure.

### What You Will Learn
- Setting up vector pipelines with hybrid search.
- Integrating streaming AI endpoints with WebSockets.
- Microservices, caching with Redis, and zero-downtime deployment.
- Hands-on coding exercises with real repository templates.
      `,
      category: catWorkshop._id,
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
      price: 0, // Free
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
      slug: 'rhythm-and-echoes-inter-college-cultural-gala',
      shortDescription: 'The biggest night of music, theatrical drama, and inter-university dance competitions.',
      description: `
Experience the rhythm and magic of **Rhythm & Echoes 2026**! Featuring 20+ college bands, solo acoustic performers, dramatic performances, and an explosive EDM after-party.
Food trucks, artisan stalls, and photo booths will line the main festival grounds.
      `,
      category: catCultural._id,
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
      slug: 'quantum-computing-and-applied-cryptography-seminar',
      shortDescription: 'Explore post-quantum cryptography algorithms, qubit architectures, and cybersecurity frontiers.',
      description: `
How will quantum computers disrupt current public key encryption? In this seminar, leading quantum researchers break down lattice-based cryptography, quantum key distribution (QKD), and practical quantum simulators.
      `,
      category: catSeminar._id,
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
      slug: 'speedcode-showdown-algorithmic-duel-championship',
      shortDescription: '1v1 speed coding battles on data structures and dynamic programming. Winner takes all!',
      description: `
Compete against top collegiate algorithmic coders in a knockout bracket! Real-time code execution, anti-cheat monitoring, and live spectators.
Languages supported: C++, Python, Java, JavaScript, Rust.
      `,
      category: catCompetition._id,
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
      slug: 'annual-international-student-ai-research-symposium',
      shortDescription: 'Presentations of published student research in LLMs, robotics, neural rendering, and bio-informatics.',
      description: `
A prestigious academic symposium bringing together undergraduate and graduate researchers. Features peer-reviewed paper presentations, poster sessions, and keynote talks from university professors.
      `,
      category: catConference._id,
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

    // 4. Pending Approval Event (For testing Admin Moderation Queue)
    const eventPending = await Event.create({
      title: 'Autonomous Robotics & Drone Systems Bootcamp',
      slug: 'autonomous-robotics-and-drone-systems-bootcamp',
      shortDescription: 'Build obstacle-avoiding quadcopters and navigate complex 3D courses with computer vision.',
      description: `
A 3-day intensive hardware bootcamp on micro-controllers (ESP32/STM32), ROS 2 (Robot Operating System), and PX4 flight stacks.
Participants will assemble kits in teams and compete in an obstacle course time trial.
      `,
      category: catWorkshop._id,
      organizer: organizer1._id,
      eventType: 'workshop',
      venueType: 'in-person',
      venueName: 'Makerspace Lab 104',
      address: 'Engineering Annex B',
      startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
      capacity: 60,
      registeredCount: 0,
      price: 25,
      currency: 'USD',
      bannerImage: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
      tags: ['Robotics', 'Hardware', 'Drones', 'ROS2', 'Makers'],
      featured: false,
      status: 'pending_approval' // <-- Ready to test admin approval!
    });

    // 5. Past Completed Event (For testing completed events, reviews, and certificates)
    const eventCompleted = await Event.create({
      title: 'DesignSphere: UI/UX & Product Design Intensive',
      slug: 'designsphere-ui-ux-product-design-intensive',
      shortDescription: 'Design thinking, Figma design systems, accessibility, and high-fidelity interactive prototyping.',
      description: `
A comprehensive 2-day intensive where 100+ students built complete responsive design systems in Figma and converted designs into production-ready frontends.
      `,
      category: catWorkshop._id,
      organizer: organizer1._id,
      eventType: 'workshop',
      venueType: 'online',
      venueName: 'Figma Live Classroom',
      address: 'Online',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
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

    // 6. Create Registrations & QR Tickets
    console.log('Generating registrations and QR tickets...');

    // Student 1 registers for HackSphere
    const reg1Num = 'ESP-HACK-001';
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
      transactionId: 'TXN-HACK-88391',
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
      transactionId: 'TXN-HACK-88391'
    });

    // Student 1 also registers for AI Masterclass (Free)
    const reg2Num = 'ESP-AIM-002';
    const qr2 = await generateTicketQR({
      registrationId: new mongoose.Types.ObjectId(),
      eventId: event2._id,
      userId: student1._id,
      userName: student1.name,
      eventTitle: event2.title,
      registrationNumber: reg2Num
    });

    const reg2 = await Registration.create({
      event: event2._id,
      user: student1._id,
      registrationNumber: reg2Num,
      status: 'confirmed',
      paymentStatus: 'free',
      amountPaid: 0,
      paymentMethod: 'free',
      ticketHash: qr2.hash,
      ticketQrData: qr2.qrDataUrl,
      attendanceStatus: 'registered'
    });
    event2.registeredCount += 1;
    await event2.save();

    // Student 1 also has a COMPLETED and CHECKED-IN registration for DesignSphere with a Review!
    const reg3Num = 'ESP-DSN-003';
    const qr3 = await generateTicketQR({
      registrationId: new mongoose.Types.ObjectId(),
      eventId: eventCompleted._id,
      userId: student1._id,
      userName: student1.name,
      eventTitle: eventCompleted.title,
      registrationNumber: reg3Num
    });

    const reg3 = await Registration.create({
      event: eventCompleted._id,
      user: student1._id,
      registrationNumber: reg3Num,
      status: 'confirmed',
      paymentStatus: 'free',
      amountPaid: 0,
      ticketHash: qr3.hash,
      ticketQrData: qr3.qrDataUrl,
      attendanceStatus: 'checked_in',
      checkedInAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      checkedInBy: organizer1._id,
      feedback: {
        rating: 5,
        comment: 'Hands down the best UI/UX workshop on campus! The live Figma component system demos were super practical.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    });
    eventCompleted.registeredCount += 1;
    await eventCompleted.save();

    // Student 2 also attended DesignSphere
    const reg4Num = 'ESP-DSN-004';
    const qr4 = await generateTicketQR({
      registrationId: new mongoose.Types.ObjectId(),
      eventId: eventCompleted._id,
      userId: student2._id,
      userName: student2.name,
      eventTitle: eventCompleted.title,
      registrationNumber: reg4Num
    });

    const reg4 = await Registration.create({
      event: eventCompleted._id,
      user: student2._id,
      registrationNumber: reg4Num,
      status: 'confirmed',
      paymentStatus: 'free',
      amountPaid: 0,
      ticketHash: qr4.hash,
      ticketQrData: qr4.qrDataUrl,
      attendanceStatus: 'checked_in',
      checkedInAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      checkedInBy: organizer1._id,
      feedback: {
        rating: 5,
        comment: 'Amazing mentors, great interactive feedback during the design challenge.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    });
    eventCompleted.registeredCount += 1;
    await eventCompleted.save();

    // 7. Create Pre-Issued Verified Certificate for Student 1
    console.log('Issuing verified certificates...');
    const certCode = 'ESP-8F29A1D4';
    await Certificate.create({
      event: eventCompleted._id,
      user: student1._id,
      registration: reg3._id,
      certificateNumber: 'CERT-2026-ESP-8F29A1D4',
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

    // 8. Create Realistic Notifications
    console.log('Creating initial notifications...');
    await Notification.create([
      {
        recipient: student1._id,
        title: '🎟️ Ticket Issued: HackSphere 2026',
        message: 'Your payment was successful. Download your QR ticket pass.',
        type: 'ticket',
        link: '/participant/registrations'
      },
      {
        recipient: student1._id,
        title: '🎓 Certificate Issued!',
        message: 'Your certificate for DesignSphere Intensive is ready for download.',
        type: 'ticket',
        link: '/participant/certificates'
      },
      {
        recipient: organizer1._id,
        title: '🚀 New Event Registration',
        message: `${student1.name} registered for HackSphere 2026.`,
        type: 'registration',
        link: `/organizer/events`
      },
      {
        recipient: adminUser._id,
        title: '⚠️ Moderation: New Event Pending Approval',
        message: 'Alex Vance submitted "Autonomous Robotics & Drone Systems Bootcamp" for review.',
        type: 'approval',
        link: `/admin/approvals`
      }
    ]);

    console.log('\n=============================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================');
    console.log('Demo Accounts:');
    console.log('👑 Admin:       admin@eventsphere.com     / admin123');
    console.log('🎪 Organizer:   organizer@eventsphere.com / organizer123');
    console.log('🎓 Participant: student@eventsphere.com   / student123');
    console.log('---------------------------------------------');
    console.log(`Public Certificate Verification Code: ${certCode}`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
