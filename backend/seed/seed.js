/**
 * Seed script — populates MongoDB Atlas with all KIET LMS mock data.
 * Run: node seed/seed.js  (from inside backend/)
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User       = require('../models/User');
const Category   = require('../models/Category');
const Course     = require('../models/Course');
const Grade      = require('../models/Grade');
const Event      = require('../models/Event');
const EBook      = require('../models/EBook');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// ─── Raw data (mirrors js/data.js) ──────────────────────────────────────────

const RAW_CATEGORIES = [
  // Top-level
  { slug: 'deemed',      name: 'KIET Deemed University', parent: null },
  { slug: 'departments', name: 'Departments',            parent: null },
  { slug: 'exam',        name: 'Examination',            parent: null },

  // Under 'deemed'
  { slug: 'cs-deemed', name: 'Computer Science', parent: 'deemed' },
  { slug: 'jp',        name: 'Mr. Jinendra Panwar',            parent: 'cs-deemed' },
  { slug: 'ag',        name: 'Dr. Akash Goel (CS)',            parent: 'cs-deemed' },
  { slug: 'aks',       name: 'Amit Kumar Singh Sanger',        parent: 'cs-deemed' },

  // Under 'departments'
  { slug: 'cs',       name: 'Computer Science',                                                       parent: 'departments' },
  { slug: 'csds',     name: 'Computer Science Engineering - Data Science',                            parent: 'departments' },
  { slug: 'cse',      name: 'Computer Science & Engineering',                                         parent: 'departments' },
  { slug: 'cses',     name: 'Computer Science and Engineering (Cyber Security)',                      parent: 'departments' },
  { slug: 'csit',     name: 'Computer Science and Information Technology',                            parent: 'departments' },
  { slug: 'cseaiml',  name: 'Computer Science Engineering (Artificial Intelligence & Machine Learning)', parent: 'departments' },
  { slug: 'cseai',    name: 'Computer Science Engineering (Artificial Intelligence)',                 parent: 'departments' },
  { slug: 'ecevlsi',  name: 'Electronics & Communication Engineering (VLSI Design & Technology)',    parent: 'departments' },
  { slug: 'en',       name: 'Electrical & Electronics Engineering',                                   parent: 'departments' },
  { slug: 'ece',      name: 'Electronics & Communication Engineering',                                parent: 'departments' },
  { slug: 'elce',     name: 'Electrical & Computer Engineering',                                      parent: 'departments' },
  { slug: 'amia',     name: 'Advanced Mechatronics and Industrial Automation',                        parent: 'departments' },
  { slug: 'eie',      name: 'Electronics & Instrumentation Engineering',                              parent: 'departments' },
  { slug: 'it',       name: 'Information Technology',                                                 parent: 'departments' },
  { slug: 'me',       name: 'Mechanical Engineering',                                                 parent: 'departments' },
  { slug: 'ash',      name: 'Applied Sciences & Humanities',                                          parent: 'departments' },
  { slug: 'mba',      name: 'MBA',                                                                    parent: 'departments' },
  { slug: 'mca',      name: 'MCA',                                                                    parent: 'departments' },
  { slug: 'ksop',     name: 'KSOP',                                                                   parent: 'departments' },
  { slug: 'td',       name: 'Training Division',                                                      parent: 'departments' },
  { slug: 'ce',       name: 'Civil Engineering',                                                      parent: 'departments' },
  { slug: 'pharma',   name: 'Pharmacy',                                                               parent: 'departments' },

  // Under 'exam'
  { slug: 'sessional', name: 'Sessional Exams',    parent: 'exam' },
  { slug: 'endterm',   name: 'End Semester Exams', parent: 'exam' }
];

// Demo assignment definitions per course slug
const DEMO_ASSIGNMENTS = {
  'dsa':   { title: 'Demo Assignment: Linked List Implementation',     description: 'Implement a singly linked list in C/C++ with insert, delete, and search operations. Submit your source code file.', dueDate: new Date('2026-11-15'), maxScore: 100 },
  'os':    { title: 'Demo Assignment: Process Scheduling',             description: 'Simulate FCFS, SJF, and Round Robin CPU scheduling algorithms. Submit your code and a short report.', dueDate: new Date('2026-11-18'), maxScore: 100 },
  'dbms':  { title: 'Demo Assignment: ER Diagram Design',              description: 'Design an ER diagram for a hospital management system and convert it to relational tables. Submit as PDF.', dueDate: new Date('2026-11-20'), maxScore: 100 },
  'cn':    { title: 'Demo Assignment: OSI Model Analysis',             description: 'Write a report explaining each layer of the OSI model with real-world examples. Submit as PDF.', dueDate: new Date('2026-11-22'), maxScore: 100 },
  'ai':    { title: 'Demo Assignment: Search Algorithm Implementation',description: 'Implement BFS and DFS search algorithms in Python. Submit source code.', dueDate: new Date('2026-11-25'), maxScore: 100 },
  'ml':    { title: 'Demo Assignment: Linear Regression',              description: 'Apply linear regression on a given dataset using Python/scikit-learn. Submit your Jupyter notebook.', dueDate: new Date('2026-11-28'), maxScore: 100 },
  'cyber': { title: 'Demo Assignment: Caesar Cipher',                  description: 'Implement encrypt and decrypt functions for Caesar cipher in any language. Submit source code.', dueDate: new Date('2026-11-30'), maxScore: 100 },
  'web':   { title: 'Demo Assignment: Responsive Web Page',            description: 'Create a responsive web page using HTML, CSS, and JavaScript. Submit as a zip file.', dueDate: new Date('2026-12-02'), maxScore: 100 },
  'se':    { title: 'Demo Assignment: SDLC Report',                    description: 'Compare Waterfall and Agile SDLC models with examples. Submit as a PDF report.', dueDate: new Date('2026-12-05'), maxScore: 100 },
  'py':    { title: 'Demo Assignment: Python Functions',               description: 'Write Python programs demonstrating functions, recursion, and file I/O. Submit .py files.', dueDate: new Date('2026-12-08'), maxScore: 100 },
  'maths': { title: 'Demo Assignment: Differential Calculus Problems', description: 'Solve the given set of 10 problems on differentiation and integration. Submit handwritten PDF scan.', dueDate: new Date('2026-12-10'), maxScore: 100 },
};

const RAW_COURSES = [
  { slug: 'dsa',    code: 'KCS-301', title: 'Data Structures',                    category: 'cse',     instructor: 'Dr. Akash Goel',           color: '#1e4f8a', enrolledSlugs: ['student'], topics: [
    { title: 'General', activities: [
      { type: 'forum',  name: 'Announcements',                        href: '#' },
      { type: 'page',   name: 'Course outline & CO-PO mapping',       href: '#' }
    ]},
    { title: 'Unit 1 — Arrays & Linked Lists', activities: [
      { type: 'file',   name: 'Unit-1 Notes (PDF)',                   href: '#' },
      { type: 'url',    name: 'Lecture recording — Arrays',           href: '#' },
      { type: 'assign', name: 'Demo Assignment: Linked List Implementation', href: '#' }
    ]},
    { title: 'Unit 2 — Stacks, Queues & Trees', activities: [
      { type: 'file',   name: 'Unit-2 Slides',                        href: '#' },
      { type: 'quiz',   name: 'Quiz 1 — Trees (20 marks)',            href: '#' }
    ]},
    { title: 'Unit 3 — Graphs & Hashing', activities: [
      { type: 'file',   name: 'Graph algorithms handout',             href: '#' },
    ]}
  ]},
  { slug: 'os',     code: 'KCS-401', title: 'Operating Systems',                  category: 'cse',     instructor: 'Mr. Jinendra Panwar',       color: '#0b6e4f', enrolledSlugs: ['student'], topics: [
    { title: 'General', activities: [
      { type: 'forum', name: 'Announcements', href: '#' },
      { type: 'page',  name: 'Course outline', href: '#' }
    ]},
    { title: 'Unit 1 — Processes & Threads', activities: [
      { type: 'file',   name: 'Unit-1 Notes (PDF)', href: '#' },
      { type: 'assign', name: 'Demo Assignment: Process Scheduling', href: '#' }
    ]}
  ]},
  { slug: 'dbms',   code: 'KCS-501', title: 'Database Management Systems',        category: 'cse',     instructor: 'Amit Kumar Singh Sanger',  color: '#7b2d8e', enrolledSlugs: ['student'], topics: [
    { title: 'General', activities: [
      { type: 'forum', name: 'Announcements', href: '#' }
    ]},
    { title: 'Unit 1 — ER Model & Relational Algebra', activities: [
      { type: 'file',   name: 'Unit-1 Notes', href: '#' },
      { type: 'quiz',   name: 'Quiz 1 — ER Diagrams', href: '#' },
      { type: 'assign', name: 'Demo Assignment: ER Diagram Design', href: '#' }
    ]}
  ]},
  { slug: 'cn',     code: 'KCS-603', title: 'Computer Networks',                  category: 'cse',     instructor: 'Dr. Akash Goel',           color: '#b35c00', enrolledSlugs: ['student'], topics: [
    { title: 'General', activities: [
      { type: 'forum', name: 'Announcements', href: '#' }
    ]},
    { title: 'Unit 1 — OSI & TCP/IP Models', activities: [
      { type: 'file',   name: 'Unit-1 Slides', href: '#' },
      { type: 'url',    name: 'Wireshark Lab', href: '#' },
      { type: 'assign', name: 'Demo Assignment: OSI Model Analysis', href: '#' }
    ]}
  ]},
  { slug: 'ai',     code: 'KCS-071', title: 'Artificial Intelligence',             category: 'cseai',   instructor: 'Dr. Akash Goel',           color: '#8b1e3f', enrolledSlugs: [], topics: [
    { title: 'General', activities: [{ type: 'forum', name: 'Announcements', href: '#' }]},
    { title: 'Unit 1 — Search Algorithms', activities: [
      { type: 'file', name: 'Unit-1 Notes', href: '#' },
      { type: 'assign', name: 'Demo Assignment: Search Algorithm Implementation', href: '#' }
    ]}
  ]},
  { slug: 'ml',     code: 'KCS-055', title: 'Machine Learning',                   category: 'cseaiml', instructor: 'Mr. Jinendra Panwar',       color: '#2c6eaa', enrolledSlugs: [], topics: [
    { title: 'General', activities: [{ type: 'forum', name: 'Announcements', href: '#' }]},
    { title: 'Unit 1 — Regression & Classification', activities: [
      { type: 'file', name: 'Unit-1 Notes', href: '#' },
      { type: 'assign', name: 'Demo Assignment: Linear Regression', href: '#' }
    ]}
  ]},
  { slug: 'cyber',  code: 'KCS-081', title: 'Cryptography & Network Security',    category: 'cses',    instructor: 'Amit Kumar Singh Sanger',  color: '#333333', enrolledSlugs: [], topics: [
    { title: 'General', activities: [{ type: 'forum', name: 'Announcements', href: '#' }]},
    { title: 'Unit 1 — Classical Ciphers', activities: [
      { type: 'file', name: 'Unit-1 Notes', href: '#' },
      { type: 'assign', name: 'Demo Assignment: Caesar Cipher', href: '#' }
    ]}
  ]},
  { slug: 'web',    code: 'KCS-652', title: 'Web Technology',                     category: 'it',      instructor: 'Mr. Jinendra Panwar',       color: '#cc4444', enrolledSlugs: ['student'], topics: [
    { title: 'General', activities: [{ type: 'forum', name: 'Announcements', href: '#' }]},
    { title: 'Unit 1 — HTML, CSS & JavaScript', activities: [
      { type: 'file', name: 'Unit-1 Notes', href: '#' },
      { type: 'assign', name: 'Demo Assignment: Responsive Web Page', href: '#' }
    ]}
  ]},
  { slug: 'se',     code: 'KCS-601', title: 'Software Engineering',               category: 'csit',    instructor: 'Dr. Akash Goel',           color: '#444466', enrolledSlugs: [], topics: [
    { title: 'General', activities: [{ type: 'forum', name: 'Announcements', href: '#' }]},
    { title: 'Unit 1 — SDLC Models', activities: [
      { type: 'file', name: 'Unit-1 Notes', href: '#' },
      { type: 'assign', name: 'Demo Assignment: SDLC Report', href: '#' }
    ]}
  ]},
  { slug: 'py',     code: 'KCS-354', title: 'Python Programming',                 category: 'csds',    instructor: 'Amit Kumar Singh Sanger',  color: '#3776ab', enrolledSlugs: ['student'], topics: [
    { title: 'General', activities: [{ type: 'forum', name: 'Announcements', href: '#' }]},
    { title: 'Unit 1 — Python Basics', activities: [
      { type: 'file', name: 'Unit-1 Notes', href: '#' },
      { type: 'assign', name: 'Demo Assignment: Python Functions', href: '#' }
    ]}
  ]},
  { slug: 'ebook',  code: 'LIB-001', title: 'Central e-Book Bank',               category: 'td',      instructor: 'Central Library',          color: '#5a4634', enrolledSlugs: ['student'], topics: []},
  { slug: 'maths',  code: 'KAS-103', title: 'Engineering Mathematics-I',          category: 'ash',     instructor: 'Applied Sciences',         color: '#2e6b4f', enrolledSlugs: [], topics: [
    { title: 'General', activities: [{ type: 'forum', name: 'Announcements', href: '#' }]},
    { title: 'Unit 1 — Differential Calculus', activities: [
      { type: 'file', name: 'Unit-1 Notes', href: '#' },
      { type: 'assign', name: 'Demo Assignment: Differential Calculus Problems', href: '#' }
    ]}
  ]}
];

const RAW_USERS = [
  { username: 'student', password: 'kiet123', name: 'Aarav Sharma',   role: 'student', department: 'CSE',             studentId: '2100290110001', enrolledSlugs: ['dsa','os','dbms','cn','web','py','ebook'] },
  { username: 'faculty', password: 'kiet123', name: 'Dr. Akash Goel', role: 'faculty', department: 'Computer Science', studentId: 'FAC-CS-014',    enrolledSlugs: [] },
  { username: 'admin',   password: 'kiet123', name: 'IT Support',      role: 'admin',   department: 'IT Cell',          studentId: 'ADM-01',        enrolledSlugs: [] }
];

const RAW_EBOOKS = [
  { title: 'Introduction to Algorithms',              author: 'Cormen, Leiserson, Rivest & Stein', category: 'Computer Science', isbn: '978-0262046305', url: '#' },
  { title: 'Operating System Concepts',               author: 'Silberschatz, Galvin & Gagne',      category: 'Computer Science', isbn: '978-1119800361', url: '#' },
  { title: 'Database System Concepts',                author: 'Silberschatz, Korth & Sudarshan',   category: 'Computer Science', isbn: '978-0078022159', url: '#' },
  { title: 'Computer Networks',                       author: 'Andrew S. Tanenbaum',               category: 'Computer Science', isbn: '978-0132126953', url: '#' },
  { title: 'Artificial Intelligence: A Modern Approach', author: 'Russell & Norvig',              category: 'AI/ML',            isbn: '978-0137903955', url: '#' },
  { title: 'Pattern Recognition and Machine Learning', author: 'Christopher M. Bishop',           category: 'AI/ML',            isbn: '978-0387310732', url: '#' },
  { title: 'Engineering Mathematics',                 author: 'B.S. Grewal',                       category: 'Mathematics',      isbn: '978-8174091955', url: '#' },
  { title: 'Web Technologies',                        author: 'Raj Kamal',                         category: 'Web',              isbn: '978-0070669086', url: '#' }
];

// ─── Seed function ───────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas');

  // Clear all collections
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Course.deleteMany({}),
    Grade.deleteMany({}),
    Event.deleteMany({}),
    EBook.deleteMany({}),
    Assignment.deleteMany({}),
    Submission.deleteMany({})
  ]);
  console.log('Cleared existing data');

  // 1. Insert categories (two passes: first pass inserts with null parent,
  //    second pass resolves parent ObjectIds)
  const catDocs = await Category.insertMany(
    RAW_CATEGORIES.map(c => ({ slug: c.slug, name: c.name, parent: null }))
  );
  const catBySlug = {};
  catDocs.forEach(d => (catBySlug[d.slug] = d));

  // Set parent refs
  for (const raw of RAW_CATEGORIES) {
    if (raw.parent) {
      await Category.updateOne(
        { slug: raw.slug },
        { parent: catBySlug[raw.parent]._id }
      );
    }
  }
  console.log(`Seeded ${catDocs.length} categories`);

  // 2. Insert courses
  const courseDocs = await Course.insertMany(
    RAW_COURSES.map(c => ({
      slug:       c.slug,
      code:       c.code,
      title:      c.title,
      category:   catBySlug[c.category]?._id || null,
      instructor: c.instructor,
      color:      c.color,
      topics:     c.topics,
      enrolledUsers: [] // filled after users are created
    }))
  );
  const courseBySlug = {};
  courseDocs.forEach(d => (courseBySlug[d.slug] = d));
  console.log(`Seeded ${courseDocs.length} courses`);

  // 3. Insert users
  const userDocs = [];
  for (const raw of RAW_USERS) {
    const passwordHash = bcrypt.hashSync(raw.password, 10);
    const enrolledCourses = raw.enrolledSlugs.map(s => courseBySlug[s]._id);
    const doc = await User.create({
      username: raw.username,
      passwordHash,
      role:     raw.role,
      name:     raw.name,
      department: raw.department,
      studentId:  raw.studentId,
      enrolledCourses
    });
    userDocs.push(doc);
  }
  const userByUsername = {};
  userDocs.forEach(d => (userByUsername[d.username] = d));
  console.log(`Seeded ${userDocs.length} users`);

  // Update courses.enrolledUsers back-references
  for (const raw of RAW_COURSES) {
    const userIds = raw.enrolledSlugs
      .map(s => userByUsername[s]?._id)
      .filter(Boolean);
    if (userIds.length) {
      await Course.updateOne({ slug: raw.slug }, { enrolledUsers: userIds });
    }
  }

  // Update category.courseCount
  for (const cat of catDocs) {
    const count = await Course.countDocuments({ category: cat._id });
    await Category.updateOne({ _id: cat._id }, { courseCount: count });
  }

  // 4. Seed grades for the student user
  const studentDoc = userByUsername['student'];
  const gradeData = [
    { slug: 'dsa',  score: 88, grade: 'A+', semester: 'Odd 2024-25' },
    { slug: 'os',   score: 76, grade: 'A',  semester: 'Odd 2024-25' },
    { slug: 'dbms', score: 82, grade: 'A+', semester: 'Even 2024-25' },
    { slug: 'cn',   score: 71, grade: 'A',  semester: 'Even 2024-25' },
    { slug: 'web',  score: 90, grade: 'O',  semester: 'Even 2024-25' },
    { slug: 'py',   score: 85, grade: 'A+', semester: 'Odd 2024-25' }
  ];
  await Grade.insertMany(
    gradeData.map(g => ({
      user:     studentDoc._id,
      course:   courseBySlug[g.slug]._id,
      score:    g.score,
      grade:    g.grade,
      semester: g.semester
    }))
  );
  console.log(`Seeded ${gradeData.length} grade records`);

  // 5. Seed calendar events
  const eventsData = [
    { title: 'DSA Assignment 1 due',           date: new Date('2026-10-05'), courseSlug: 'dsa',  type: 'assignment' },
    { title: 'OS Quiz 1',                       date: new Date('2026-10-08'), courseSlug: 'os',   type: 'quiz' },
    { title: 'DBMS Mid-term Exam',              date: new Date('2026-10-12'), courseSlug: 'dbms', type: 'exam' },
    { title: 'Computer Networks Lab',           date: new Date('2026-10-15'), courseSlug: 'cn',   type: 'lecture' },
    { title: 'Web Technology Project Deadline', date: new Date('2026-10-20'), courseSlug: 'web',  type: 'assignment' },
    { title: 'Python Lab Test',                 date: new Date('2026-10-22'), courseSlug: 'py',   type: 'quiz' },
    { title: 'DSA End-Semester Exam',           date: new Date('2026-11-10'), courseSlug: 'dsa',  type: 'exam' },
    { title: 'OS End-Semester Exam',            date: new Date('2026-11-12'), courseSlug: 'os',   type: 'exam' }
  ];
  await Event.insertMany(
    eventsData.map(e => ({
      title:  e.title,
      date:   e.date,
      course: courseBySlug[e.courseSlug]._id,
      type:   e.type
    }))
  );
  console.log(`Seeded ${eventsData.length} calendar events`);

  // 6. Seed ebooks
  await EBook.insertMany(RAW_EBOOKS);
  console.log(`Seeded ${RAW_EBOOKS.length} ebooks`);

  // 7. Seed demo assignments + link assignmentId back into course activities
  let assignmentCount = 0;
  for (const [slug, def] of Object.entries(DEMO_ASSIGNMENTS)) {
    const courseDoc = courseBySlug[slug];
    if (!courseDoc) continue;

    // Create the Assignment document
    const aDoc = await Assignment.create({
      course:      courseDoc._id,
      title:       def.title,
      description: def.description,
      dueDate:     def.dueDate,
      maxScore:    def.maxScore,
    });
    assignmentCount++;

    // Patch the matching activity in the course topics with assignmentId
    const course = await Course.findById(courseDoc._id);
    let patched = false;
    for (const topic of course.topics) {
      for (const act of topic.activities) {
        if (act.type === 'assign' && act.name === def.title) {
          act.assignmentId = aDoc._id;
          patched = true;
        }
      }
    }
    if (patched) {
      course.markModified('topics');
      await course.save();
    }
  }
  console.log(`Seeded ${assignmentCount} demo assignments`);

  console.log('\n✅ Seed complete!');
  console.log('Demo credentials:  student/kiet123 · faculty/kiet123 · admin/kiet123');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
