const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed with Gujarati Question Bank...');

  // 1. Create or Update Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sarkarimitra.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      name: 'SarkariMitra Administrator',
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'SarkariMitra Administrator',
    },
  });

  console.log(`✅ Admin account ready: ${admin.email}`);

  // 2. Clear all previous questions, exam questions, exams, and attempts cleanly
  console.log('🧹 Cleaning previous database records...');
  await prisma.attemptAnswer.deleteMany({});
  await prisma.examAttempt.deleteMany({});
  await prisma.examQuestion.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.question.deleteMany({});

  // 3. Authentic Gujarati Questions Bank for Competitive Exams
  const gujaratiQuestions = [
    {
      questionText: 'ગુજરાત રાજ્યના પ્રથમ મુખ્યમંત્રી કોણ હતા?',
      optionA: 'ડૉ. જીવરાજ નારાયણ મહેતા',
      optionB: 'બળવંતરાય મહેતા',
      optionC: 'હિતેન્દ્ર દેસાઈ',
      optionD: 'ઘનશ્યામ ઓઝા',
      correctAnswer: 'A',
      category: 'Gujarat GK',
      difficulty: 'Easy',
      explanation: '૧ મે ૧૯૬૦ના રોજ બૃહદ મુંબઈ રાજ્યમાંથી અલગ થઈ ગુજરાત રાજ્ય અસ્તિત્વમાં આવ્યું ત્યારે પ્રથમ મુખ્યમંત્રી તરીકે ડૉ. જીવરાજ મહેતાએ શપથ લીધા હતા.',
    },
    {
      questionText: 'ગુજરાતના કયા શહેરને "ભારતનું માન્ચેસ્ટર" તરીકે ઓળખવામાં આવતું હતું?',
      optionA: 'સુરત',
      optionB: 'વડોદરા',
      optionC: 'અમદાવાદ',
      optionD: 'રાજકોટ',
      correctAnswer: 'C',
      category: 'Gujarat GK',
      difficulty: 'Easy',
      explanation: 'અમદાવાદ તેના વિશાળ સુતરાઉ કાપડ ઉદ્યોગ અને મિલોના કારણે ભારતનું માન્ચેસ્ટર તરીકે પ્રખ્યાત હતું.',
    },
    {
      questionText: 'એશિયાટીક સિંહ (Asiatic Lions) માત્ર કયા રાષ્ટ્રીય ઉદ્યાનમાં જોવા મળે છે?',
      optionA: 'વેળાવદર બ્લેકબક નેશનલ પાર્ક',
      optionB: 'ગીર રાષ્ટ્રીય ઉદ્યાન',
      optionC: 'વાંસદા નેશનલ પાર્ક',
      optionD: 'મરીન નેશનલ પાર્ક, કચ્છનો અખાત',
      correctAnswer: 'B',
      category: 'Gujarat GK',
      difficulty: 'Easy',
      explanation: 'ગીર રાષ્ટ્રીય ઉદ્યાન અને અભયારણ્ય એશિયાઈ સિંહોનું સમગ્ર વિશ્વમાં એકમાત્ર કુદરતી નિવાસસ્થાન છે.',
    },
    {
      questionText: 'ગુજરાતમાં ૧૯૩૦ માં ઐતિહાસિક દાંડી સત્યાગ્રહ કુચનું નેતૃત્વ કોણે કર્યું હતું?',
      optionA: 'સરદાર વલ્લભભાઈ પટેલ',
      optionB: 'મહાત્મા ગાંધી',
      optionC: 'મોરારજી દેસાઈ',
      optionD: 'કનૈયાલાલ મુનશી',
      correctAnswer: 'B',
      category: 'History',
      difficulty: 'Easy',
      explanation: 'મહાત્મા ગાંધીજીએ ૧૨ માર્ચ ૧૯૩૦ના રોજ સાબરમતી આશ્રમથી મીઠાના અન્યાયી કર સામે દાંડી યાત્રા શરૂ કરી હતી.',
    },
    {
      questionText: 'સરદાર વલ્લભભાઈ પટેલની "સ્ટેચ્યુ ઓફ યુનિટી" પ્રતિમા કઈ નદીના બેટ પર આવેલી છે?',
      optionA: 'તાપી (સાધુ બેટ)',
      optionB: 'નર્મદા (સાધુ બેટ)',
      optionC: 'સાબરમતી (સાધુ બેટ)',
      optionD: 'મહી (સાધુ બેટ)',
      correctAnswer: 'B',
      category: 'Gujarat GK',
      difficulty: 'Medium',
      explanation: 'સ્ટેચ્યુ ઓફ યુનિટી નર્મદા નદી પર કેવડિયા ખાતે આવેલ સાધુ બેટ પર સ્થિત ૧૮૨ મીટર ઊંચી પ્રતિમા છે.',
    },
    {
      questionText: 'સિંધુ ખીણની સંસ્કૃતિનું પ્રસિદ્ધ બંદર "લોથલ" ગુજરાતના કયા જિલ્લામાં આવેલું છે?',
      optionA: 'કચ્છ',
      optionB: 'સુરેન્દ્રનગર',
      optionC: 'અમદાવાદ',
      optionD: 'રાજકોટ',
      correctAnswer: 'C',
      category: 'History',
      difficulty: 'Medium',
      explanation: 'લોથલ પ્રાચીન સિંધુ ખીણની સંસ્કૃતિનું આંતરરાષ્ટ્રીય બંદર હતું જે અમદાવાદ જિલ્લાના ધોળકા તાલુકામાં આવેલું છે.',
    },
    {
      questionText: 'ભારતીય બંધારણના કયા અનુચ્છેદ મુજબ રાજ્યના રાજ્યપાલની નિમણૂક કરવામાં આવે છે?',
      optionA: 'અનુચ્છેદ ૧૫૩',
      optionB: 'અનુચ્છેદ ૧૫૫',
      optionC: 'અનુચ્છેદ ૧૬૧',
      optionD: 'અનુચ્છેદ ૨૧૩',
      correctAnswer: 'B',
      category: 'Indian Polity',
      difficulty: 'Medium',
      explanation: 'ભારતના બંધારણના અનુચ્છેદ ૧૫૫ હેઠળ દેશના રાષ્ટ્રપતિ દ્વારા રાજ્યપાલની નિમણૂક કરવામાં આવે છે.',
    },
    {
      questionText: 'સૂર્યમંડળનો કયો ગ્રહ "લાલ ગ્રહ" (Red Planet) તરીકે ઓળખાય છે?',
      optionA: 'શુક્ર',
      optionB: 'મંગળ',
      optionC: 'બુધ',
      optionD: 'ગુરુ',
      correctAnswer: 'B',
      category: 'Science',
      difficulty: 'Easy',
      explanation: 'મંગળ ગ્રહની સપાટી પર આયર્ન ઓક્સાઈડ (કાટ) ની વિપુલતાને કારણે તે લાલ દેખાય છે.',
    },
    {
      questionText: 'વિશ્વની સૌથી પ્રાચીન પર્વતમાળા કઈ ગણાય છે?',
      optionA: 'હિમાલય',
      optionB: 'અરવલ્લી',
      optionC: 'સાતપુડા',
      optionD: 'પશ્ચિમ ઘાટ',
      correctAnswer: 'B',
      category: 'Geography',
      difficulty: 'Medium',
      explanation: 'અરવલ્લી પર્વતમાળા એ ભારત અને વિશ્વની સૌથી પ્રાચીન ગિરિમાળાઓમાંની એક છે.',
    },
    {
      questionText: 'વિશ્વ હેરિટેજ સાઇટનો દરજ્જો મેળવનાર "રાણકી વાવ" ગુજરાતના કયા શહેરમાં આવેલી છે?',
      optionA: 'પાટણ',
      optionB: 'જૂનાગઢ',
      optionC: 'મોઢેરા',
      optionD: 'જામનગર',
      correctAnswer: 'A',
      category: 'Gujarat GK',
      difficulty: 'Easy',
      explanation: 'સોલંકી વંશના રાણી ઉદયમતીએ બંધાવેલ પાટણની રાણકી વાવને UNESCO દ્વારા વર્લ્ડ હેરિટેજ સાઇટ જાહેર કરવામાં આવી છે.',
    },
    {
      questionText: 'ભારતના બંધારણીય વડા કોણ ગણાય છે?',
      optionA: 'વડાપ્રધાન',
      optionB: 'રાષ્ટ્રપતિ',
      optionC: 'મુખ્ય ન્યાયાધીશ (CJI)',
      optionD: 'લોકસભા અધ્યક્ષ',
      correctAnswer: 'B',
      category: 'Indian Polity',
      difficulty: 'Easy',
      explanation: 'ભારતના રાષ્ટ્રપતિ દેશના પ્રથમ નાગરિક અને બંધારણીય કારોબારી વડા છે.',
    },
    {
      questionText: 'જો CAT = 24 અને DOG = 26 હોય, તો PIG = ?',
      optionA: '32',
      optionB: '30',
      optionC: '31',
      optionD: '35',
      correctAnswer: 'A',
      category: 'Reasoning',
      difficulty: 'Medium',
      explanation: 'અક્ષરોના ક્રમનો સરવાળો: P(16) + I(9) + G(7) = 32.',
    },
  ];

  const createdQuestions = [];
  for (const q of gujaratiQuestions) {
    const created = await prisma.question.create({ data: q });
    createdQuestions.push(created);
  }

  console.log(`✅ Seeded ${createdQuestions.length} Gujarati MCQs into Question Bank.`);

  // 4. Create Active Sample Exam in Gujarati
  const demoToken = '7f3c9a2e4b8d9c1a3e5f7a9b';
  const now = new Date();
  const startAt = new Date(now.getTime() - 1000 * 60 * 60 * 24);
  const endAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);

  const exam = await prisma.exam.create({
    data: {
      title: 'ગુજરાત સામાન્ય જ્ઞાન મોક ટેસ્ટ - ૦૧ (GPSC/GSSSB)',
      description: 'ગુજરાત સરકારની સ્પર્ધાત્મક પરીક્ષાઓ માટે વિશેષ મોક ટેસ્ટ શ્રેણી.',
      publicToken: demoToken,
      startAt: startAt,
      endAt: endAt,
      durationMinutes: 15,
      isActive: true,
    },
  });

  // Attach all 12 Gujarati questions to sample exam
  for (let i = 0; i < createdQuestions.length; i++) {
    await prisma.examQuestion.create({
      data: {
        examId: exam.id,
        questionId: createdQuestions[i].id,
        questionOrder: i + 1,
      },
    });
  }

  console.log(`✅ Created Sample Gujarati Exam! Token: ${demoToken}`);
  console.log('🌱 Database re-seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
