require('dotenv').config();
const mongoose = require('mongoose');
const Expert = require('./models/Expert');

const connectDB = require('./config/db');

const generateSlots = () => {
  const slots = [];
  const today = new Date();
  for (let d = 1; d <= 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends
    const dateStr = date.toISOString().split('T')[0];
    const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    times.forEach((time) => {
      slots.push({ date: dateStr, time, isBooked: false });
    });
  }
  return slots;
};

const experts = [
  {
    name: 'Dr. Priya Sharma',
    category: 'Health',
    bio: 'Board-certified physician with expertise in preventive medicine and chronic disease management. Author of two best-selling health guides.',
    experience: 15,
    rating: 4.9,
    reviewCount: 342,
    hourlyRate: 150,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    skills: ['Preventive Medicine', 'Nutrition', 'Mental Health', 'Chronic Disease'],
    timeSlots: generateSlots(),
  },
  {
    name: 'Arjun Mehta',
    category: 'Technology',
    bio: 'Ex-Google Senior Engineer with 12 years building scalable systems. Advisor to 3 successful tech startups.',
    experience: 12,
    rating: 4.8,
    reviewCount: 218,
    hourlyRate: 200,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun',
    skills: ['System Design', 'Cloud Architecture', 'React', 'Node.js', 'AI/ML'],
    timeSlots: generateSlots(),
  },
  {
    name: 'Kavita Nair',
    category: 'Finance',
    bio: 'Certified Financial Planner with deep expertise in wealth management, tax optimization, and retirement planning for HNIs.',
    experience: 18,
    rating: 4.7,
    reviewCount: 187,
    hourlyRate: 175,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kavita',
    skills: ['Wealth Management', 'Tax Planning', 'Investments', 'Retirement Planning'],
    timeSlots: generateSlots(),
  },
  {
    name: 'Rahul Verma',
    category: 'Legal',
    bio: 'Senior advocate specializing in corporate law, M&A transactions, and intellectual property rights. 200+ successful cases.',
    experience: 20,
    rating: 4.9,
    reviewCount: 156,
    hourlyRate: 250,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
    skills: ['Corporate Law', 'M&A', 'IP Rights', 'Contract Law'],
    timeSlots: generateSlots(),
  },
  {
    name: 'Sneha Kapoor',
    category: 'Marketing',
    bio: 'Growth hacker who scaled 5 D2C brands from 0 to $10M ARR. Expert in performance marketing, SEO, and brand storytelling.',
    experience: 9,
    rating: 4.6,
    reviewCount: 293,
    hourlyRate: 120,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneha',
    skills: ['Growth Hacking', 'SEO', 'Performance Marketing', 'Brand Strategy'],
    timeSlots: generateSlots(),
  },
  {
    name: 'Vikram Singh',
    category: 'Design',
    bio: 'Product designer with portfolio spanning Fortune 500 companies. Specializes in UX research and design systems.',
    experience: 11,
    rating: 4.8,
    reviewCount: 174,
    hourlyRate: 140,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram',
    skills: ['UX Design', 'Design Systems', 'Figma', 'User Research', 'Prototyping'],
    timeSlots: generateSlots(),
  },
  {
    name: 'Ananya Bose',
    category: 'Business',
    bio: 'Serial entrepreneur and business strategist. Founded and exited 2 companies. Mentor at IIM Bangalore.',
    experience: 16,
    rating: 4.7,
    reviewCount: 201,
    hourlyRate: 180,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ananya',
    skills: ['Business Strategy', 'Fundraising', 'Operations', 'Leadership', 'Scaling'],
    timeSlots: generateSlots(),
  },
  {
    name: 'Ravi Kumar',
    category: 'Education',
    bio: 'Former IIT professor turned EdTech entrepreneur. Helped 10,000+ students crack competitive exams and career transitions.',
    experience: 14,
    rating: 4.5,
    reviewCount: 512,
    hourlyRate: 80,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ravi',
    skills: ['Career Coaching', 'JEE/UPSC Prep', 'Academic Guidance', 'EdTech'],
    timeSlots: generateSlots(),
  },
  {
    name: 'Meera Joshi',
    category: 'Technology',
    bio: 'AI/ML researcher with PhD from IISc. Published 30+ papers. Consults on applied ML and data science strategy.',
    experience: 8,
    rating: 4.9,
    reviewCount: 97,
    hourlyRate: 220,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=meera',
    skills: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'MLOps'],
    timeSlots: generateSlots(),
  },
  {
    name: 'Sanjay Gupta',
    category: 'Finance',
    bio: 'Investment banker turned startup CFO. Expert in fundraising, financial modeling, and building finance teams from scratch.',
    experience: 13,
    rating: 4.6,
    reviewCount: 143,
    hourlyRate: 160,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sanjay',
    skills: ['Investment Banking', 'Fundraising', 'Financial Modeling', 'CFO Advisory'],
    timeSlots: generateSlots(),
  },
];

const seed = async () => {
  await connectDB();
  await Expert.deleteMany({});
  await Expert.insertMany(experts);
  console.log(`✅ Seeded ${experts.length} experts`);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
