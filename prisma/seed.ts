import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'slp@fluentflow.com' },
    update: {},
    create: {
      email: 'slp@fluentflow.com',
      password: hashedPassword,
      name: 'Demo SLP',
      role: 'SLP',
    },
  });

  // Create teachers
  const teachers = await Promise.all([
    prisma.teacher.create({
      data: {
        name: 'Ms. Johnson',
        email: 'johnson@school.edu',
        classroom: 'Room 101',
      },
    }),
    prisma.teacher.create({
      data: {
        name: 'Mr. Smith',
        email: 'smith@school.edu',
        classroom: 'Room 102',
      },
    }),
    prisma.teacher.create({
      data: {
        name: 'Mrs. Davis',
        email: 'davis@school.edu',
        classroom: 'Room 103',
      },
    }),
  ]);

  // Create classrooms
  const classrooms = await Promise.all([
    prisma.classroom.create({
      data: {
        name: 'Kindergarten - Room 101',
        teacherId: teachers[0].id,
        grade: 'K',
      },
    }),
    prisma.classroom.create({
      data: {
        name: '1st Grade - Room 102',
        teacherId: teachers[1].id,
        grade: '1',
      },
    }),
  ]);

  // Create goal templates
  const goalTemplates = [
    // Articulation
    { targetArea: 'Articulation', category: 'Initial /s/', goalText: 'Student will produce /s/ in initial position of words with 80% accuracy', description: 'Targeting initial /s/ sound production' },
    { targetArea: 'Articulation', category: 'Initial /r/', goalText: 'Student will produce /r/ in initial position of words with 80% accuracy', description: 'Targeting initial /r/ sound production' },
    { targetArea: 'Articulation', category: 'Final /l/', goalText: 'Student will produce /l/ in final position of words with 80% accuracy', description: 'Targeting final /l/ sound production' },
    { targetArea: 'Articulation', category: 'Blends', goalText: 'Student will produce /s/ blends in words with 80% accuracy', description: 'Targeting /s/ blend production' },
    { targetArea: 'Articulation', category: 'Vocalic /r/', goalText: 'Student will produce vocalic /r/ in words with 80% accuracy', description: 'Targeting vocalic /r/ variations' },
    { targetArea: 'Articulation', category: 'Initial /k/', goalText: 'Student will produce /k/ in initial position of words with 80% accuracy', description: 'Targeting initial /k/ sound production' },
    { targetArea: 'Articulation', category: 'Initial /g/', goalText: 'Student will produce /g/ in initial position of words with 80% accuracy', description: 'Targeting initial /g/ sound production' },
    { targetArea: 'Articulation', category: 'Initial /f/', goalText: 'Student will produce /f/ in initial position of words with 80% accuracy', description: 'Targeting initial /f/ sound production' },
    { targetArea: 'Articulation', category: 'Multisyllabic', goalText: 'Student will produce 3-syllable words with correct articulation with 80% accuracy', description: 'Targeting articulation in longer words' },
    { targetArea: 'Articulation', category: 'Conversation', goalText: 'Student will produce target sounds correctly in conversation with 80% accuracy', description: 'Carryover to conversational speech' },

    // Phonology
    { targetArea: 'Phonology', category: 'Final Consonant Deletion', goalText: 'Student will produce final consonants in CVC words with 80% accuracy', description: 'Eliminating final consonant deletion' },
    { targetArea: 'Phonology', category: 'Fronting', goalText: 'Student will produce back sounds /k/ and /g/ without fronting with 80% accuracy', description: 'Eliminating fronting process' },
    { targetArea: 'Phonology', category: 'Stopping', goalText: 'Student will produce fricatives without stopping with 80% accuracy', description: 'Eliminating stopping of fricatives' },
    { targetArea: 'Phonology', category: 'Gliding', goalText: 'Student will produce liquids /r/ and /l/ without gliding with 80% accuracy', description: 'Eliminating gliding of liquids' },
    { targetArea: 'Phonology', category: 'Cluster Reduction', goalText: 'Student will produce consonant clusters without reduction with 80% accuracy', description: 'Eliminating cluster reduction' },
    { targetArea: 'Phonology', category: 'Weak Syllable Deletion', goalText: 'Student will produce all syllables in multisyllabic words with 80% accuracy', description: 'Eliminating weak syllable deletion' },
    { targetArea: 'Phonology', category: 'Deaffrication', goalText: 'Student will produce affricates correctly with 80% accuracy', description: 'Correct affricate production' },
    { targetArea: 'Phonology', category: 'Vowelization', goalText: 'Student will produce /l/ and /r/ without vowelization with 80% accuracy', description: 'Eliminating vowelization' },
    { targetArea: 'Phonology', category: 'Minimal Pairs', goalText: 'Student will discriminate and produce minimal pairs with 80% accuracy', description: 'Using minimal pairs approach' },
    { targetArea: 'Phonology', category: 'Phonological Awareness', goalText: 'Student will identify initial sounds in words with 80% accuracy', description: 'Developing phonological awareness' },

    // Expressive Language
    { targetArea: 'Expressive Language', category: 'Vocabulary', goalText: 'Student will use grade-level vocabulary in sentences with 80% accuracy', description: 'Expanding expressive vocabulary' },
    { targetArea: 'Expressive Language', category: 'Sentence Structure', goalText: 'Student will produce grammatically correct 5-7 word sentences with 80% accuracy', description: 'Improving sentence structure' },
    { targetArea: 'Expressive Language', category: 'Past Tense', goalText: 'Student will use regular past tense verbs correctly with 80% accuracy', description: 'Targeting past tense morphology' },
    { targetArea: 'Expressive Language', category: 'Plurals', goalText: 'Student will use regular plurals correctly with 80% accuracy', description: 'Targeting plural morphology' },
    { targetArea: 'Expressive Language', category: 'Pronouns', goalText: 'Student will use subjective pronouns correctly with 80% accuracy', description: 'Targeting pronoun usage' },
    { targetArea: 'Expressive Language', category: 'Questions', goalText: 'Student will formulate wh-questions appropriately with 80% accuracy', description: 'Developing question formulation' },
    { targetArea: 'Expressive Language', category: 'Describing', goalText: 'Student will describe objects using 3+ attributes with 80% accuracy', description: 'Expanding descriptive language' },
    { targetArea: 'Expressive Language', category: 'Sequencing', goalText: 'Student will sequence and retell 3-step events with 80% accuracy', description: 'Developing sequencing skills' },
    { targetArea: 'Expressive Language', category: 'Conjunctions', goalText: 'Student will use conjunctions to combine sentences with 80% accuracy', description: 'Using conjunctions appropriately' },
    { targetArea: 'Expressive Language', category: 'Requesting', goalText: 'Student will make appropriate requests using complete sentences with 80% accuracy', description: 'Functional requesting skills' },

    // Receptive Language
    { targetArea: 'Receptive Language', category: 'Following Directions', goalText: 'Student will follow 2-step directions with 80% accuracy', description: 'Following multi-step directions' },
    { targetArea: 'Receptive Language', category: 'Vocabulary Comprehension', goalText: 'Student will identify grade-level vocabulary with 80% accuracy', description: 'Understanding vocabulary' },
    { targetArea: 'Receptive Language', category: 'Spatial Concepts', goalText: 'Student will demonstrate understanding of spatial concepts with 80% accuracy', description: 'Understanding prepositions' },
    { targetArea: 'Receptive Language', category: 'Temporal Concepts', goalText: 'Student will demonstrate understanding of temporal concepts with 80% accuracy', description: 'Understanding time concepts' },
    { targetArea: 'Receptive Language', category: 'Categories', goalText: 'Student will identify category members with 80% accuracy', description: 'Understanding categories' },
    { targetArea: 'Receptive Language', category: 'WH Questions', goalText: 'Student will answer wh-questions about stories with 80% accuracy', description: 'Comprehending questions' },
    { targetArea: 'Receptive Language', category: 'Inferencing', goalText: 'Student will make simple inferences from pictures/stories with 80% accuracy', description: 'Making inferences' },
    { targetArea: 'Receptive Language', category: 'Main Idea', goalText: 'Student will identify main idea of short passages with 80% accuracy', description: 'Identifying main ideas' },
    { targetArea: 'Receptive Language', category: 'Comparisons', goalText: 'Student will identify similarities and differences with 80% accuracy', description: 'Understanding comparisons' },
    { targetArea: 'Receptive Language', category: 'Problem Solving', goalText: 'Student will identify solutions to simple problems with 80% accuracy', description: 'Problem solving skills' },

    // Pragmatics
    { targetArea: 'Pragmatics', category: 'Eye Contact', goalText: 'Student will maintain appropriate eye contact during conversation with 80% accuracy', description: 'Improving eye contact' },
    { targetArea: 'Pragmatics', category: 'Turn Taking', goalText: 'Student will take appropriate conversational turns with 80% accuracy', description: 'Conversational turn taking' },
    { targetArea: 'Pragmatics', category: 'Topic Maintenance', goalText: 'Student will maintain topic for 3+ exchanges with 80% accuracy', description: 'Staying on topic' },
    { targetArea: 'Pragmatics', category: 'Personal Space', goalText: 'Student will maintain appropriate personal space with 80% accuracy', description: 'Understanding personal boundaries' },
    { targetArea: 'Pragmatics', category: 'Greetings', goalText: 'Student will use appropriate greetings and farewells with 80% accuracy', description: 'Social greetings' },
    { targetArea: 'Pragmatics', category: 'Emotions', goalText: 'Student will identify and express emotions appropriately with 80% accuracy', description: 'Emotional expression' },
    { targetArea: 'Pragmatics', category: 'Perspective Taking', goalText: 'Student will demonstrate perspective taking in social scenarios with 80% accuracy', description: 'Understanding others perspectives' },
    { targetArea: 'Pragmatics', category: 'Social Problem Solving', goalText: 'Student will identify appropriate solutions to social problems with 80% accuracy', description: 'Solving social conflicts' },
    { targetArea: 'Pragmatics', category: 'Nonverbal Communication', goalText: 'Student will interpret nonverbal cues appropriately with 80% accuracy', description: 'Reading body language' },
    { targetArea: 'Pragmatics', category: 'Peer Interaction', goalText: 'Student will initiate and maintain peer interactions appropriately with 80% accuracy', description: 'Peer social skills' },

    // Fluency
    { targetArea: 'Fluency', category: 'Smooth Speech', goalText: 'Student will use smooth speech techniques in structured tasks with 80% accuracy', description: 'Fluency shaping techniques' },
    { targetArea: 'Fluency', category: 'Easy Onset', goalText: 'Student will use easy onset of speech with 80% accuracy', description: 'Gentle voice onset' },
    { targetArea: 'Fluency', category: 'Pacing', goalText: 'Student will use appropriate speech rate with 80% accuracy', description: 'Controlling speech rate' },
    { targetArea: 'Fluency', category: 'Breathing', goalText: 'Student will use appropriate breathing patterns for speech with 80% accuracy', description: 'Breath support for speech' },
    { targetArea: 'Fluency', category: 'Self-Monitoring', goalText: 'Student will self-monitor fluency with 80% accuracy', description: 'Awareness of fluency' },
    { targetArea: 'Fluency', category: 'Strategies', goalText: 'Student will use fluency strategies independently with 80% accuracy', description: 'Using learned strategies' },
    { targetArea: 'Fluency', category: 'Cancellation', goalText: 'Student will use cancellation technique when stuttering occurs with 80% accuracy', description: 'Stuttering modification' },
    { targetArea: 'Fluency', category: 'Pull-out', goalText: 'Student will use pull-out technique during moments of stuttering with 80% accuracy', description: 'Modifying stutters' },
    { targetArea: 'Fluency', category: 'Preparatory Set', goalText: 'Student will use preparatory set before difficult words with 80% accuracy', description: 'Anticipating difficulty' },
    { targetArea: 'Fluency', category: 'Desensitization', goalText: 'Student will participate in desensitization activities with reduced anxiety', description: 'Reducing speech anxiety' },

    // AAC
    { targetArea: 'AAC', category: 'Device Navigation', goalText: 'Student will navigate AAC device to locate vocabulary with 80% accuracy', description: 'Finding words on device' },
    { targetArea: 'AAC', category: 'Requesting', goalText: 'Student will use AAC to make requests with 80% accuracy', description: 'Functional requesting with AAC' },
    { targetArea: 'AAC', category: 'Commenting', goalText: 'Student will use AAC to make comments with 80% accuracy', description: 'Social commenting with AAC' },
    { targetArea: 'AAC', category: 'Core Vocabulary', goalText: 'Student will use core vocabulary on AAC with 80% accuracy', description: 'High frequency word use' },
    { targetArea: 'AAC', category: 'Combining Words', goalText: 'Student will combine 2+ words on AAC with 80% accuracy', description: 'Multi-word messages' },
    { targetArea: 'AAC', category: 'Repair Strategies', goalText: 'Student will use repair strategies when communication breaks down with 80% accuracy', description: 'Communication repair' },
    { targetArea: 'AAC', category: 'Partner Training', goalText: 'Student will train communication partners in AAC use with 80% accuracy', description: 'Teaching others' },
    { targetArea: 'AAC', category: 'Multimodal', goalText: 'Student will use multiple modes of communication appropriately with 80% accuracy', description: 'Combining AAC with other modes' },
    { targetArea: 'AAC', category: 'Social Functions', goalText: 'Student will use AAC for various social functions with 80% accuracy', description: 'Social communication via AAC' },
    { targetArea: 'AAC', category: 'Academic Participation', goalText: 'Student will use AAC to participate in academic activities with 80% accuracy', description: 'Classroom AAC use' },

    // Vocabulary
    { targetArea: 'Vocabulary', category: 'Tier 2 Words', goalText: 'Student will define and use Tier 2 vocabulary words with 80% accuracy', description: 'Academic vocabulary' },
    { targetArea: 'Vocabulary', category: 'Context Clues', goalText: 'Student will use context clues to determine word meanings with 80% accuracy', description: 'Using context for meaning' },
    { targetArea: 'Vocabulary', category: 'Synonyms', goalText: 'Student will identify and use synonyms with 80% accuracy', description: 'Understanding word relationships' },
    { targetArea: 'Vocabulary', category: 'Antonyms', goalText: 'Student will identify and use antonyms with 80% accuracy', description: 'Understanding opposites' },
    { targetArea: 'Vocabulary', category: 'Multiple Meanings', goalText: 'Student will identify multiple meanings of words with 80% accuracy', description: 'Understanding homonyms' },
    { targetArea: 'Vocabulary', category: 'Word Associations', goalText: 'Student will make appropriate word associations with 80% accuracy', description: 'Connecting related words' },
    { targetArea: 'Vocabulary', category: 'Definitions', goalText: 'Student will provide clear definitions of vocabulary words with 80% accuracy', description: 'Defining words' },
    { targetArea: 'Vocabulary', category: 'Categorization', goalText: 'Student will categorize vocabulary by semantic features with 80% accuracy', description: 'Grouping words' },
    { targetArea: 'Vocabulary', category: 'Word Parts', goalText: 'Student will use prefixes and suffixes to determine meaning with 80% accuracy', description: 'Morphological awareness' },
    { targetArea: 'Vocabulary', category: 'Academic Language', goalText: 'Student will use academic language appropriately with 80% accuracy', description: 'School vocabulary' },

    // Narratives
    { targetArea: 'Narratives', category: 'Story Grammar', goalText: 'Student will include all story grammar elements when retelling with 80% accuracy', description: 'Complete story structure' },
    { targetArea: 'Narratives', category: 'Sequencing', goalText: 'Student will sequence story events in logical order with 80% accuracy', description: 'Temporal sequencing' },
    { targetArea: 'Narratives', category: 'Personal Narratives', goalText: 'Student will produce personal narratives with clear structure with 80% accuracy', description: 'Telling personal stories' },
    { targetArea: 'Narratives', category: 'Story Generation', goalText: 'Student will generate original stories with complete elements with 80% accuracy', description: 'Creating stories' },
    { targetArea: 'Narratives', category: 'Character Description', goalText: 'Student will describe story characters with detail with 80% accuracy', description: 'Character development' },
    { targetArea: 'Narratives', category: 'Setting Description', goalText: 'Student will describe story settings with detail with 80% accuracy', description: 'Setting details' },
    { targetArea: 'Narratives', category: 'Problem/Solution', goalText: 'Student will identify and describe story problems and solutions with 80% accuracy', description: 'Story conflict resolution' },
    { targetArea: 'Narratives', category: 'Cohesive Ties', goalText: 'Student will use cohesive ties to connect story elements with 80% accuracy', description: 'Story cohesion' },
    { targetArea: 'Narratives', category: 'Dialogue', goalText: 'Student will include appropriate dialogue in narratives with 80% accuracy', description: 'Character speech' },
    { targetArea: 'Narratives', category: 'Descriptive Language', goalText: 'Student will use descriptive language in narratives with 80% accuracy', description: 'Rich story language' },
  ];

  await prisma.goalTemplate.createMany({
    data: goalTemplates,
  });

  // Create students
  const students = await Promise.all([
    prisma.student.create({
      data: {
        name: 'Emma Thompson',
        dateOfBirth: new Date('2018-03-15'),
        grade: 'K',
        classroomId: classrooms[0].id,
        teacherId: teachers[0].id,
        guardians: JSON.stringify(['Sarah Thompson', 'John Thompson']),
        iepDates: JSON.stringify(['2023-09-01', '2024-03-01']),
        notes: 'Very engaged, responds well to visual supports',
        isActive: true,
      },
    }),
    prisma.student.create({
      data: {
        name: 'Liam Chen',
        dateOfBirth: new Date('2017-11-22'),
        grade: '1',
        classroomId: classrooms[1].id,
        teacherId: teachers[1].id,
        guardians: JSON.stringify(['Michelle Chen', 'David Chen']),
        iepDates: JSON.stringify(['2023-10-15']),
        notes: 'Benefits from movement breaks',
        isActive: true,
      },
    }),
    prisma.student.create({
      data: {
        name: 'Sophia Rodriguez',
        dateOfBirth: new Date('2018-07-08'),
        grade: 'K',
        classroomId: classrooms[0].id,
        teacherId: teachers[0].id,
        guardians: JSON.stringify(['Maria Rodriguez', 'Carlos Rodriguez']),
        iepDates: JSON.stringify(['2023-09-01']),
        notes: 'Bilingual - Spanish/English',
        isActive: true,
      },
    }),
    prisma.student.create({
      data: {
        name: 'Noah Williams',
        dateOfBirth: new Date('2017-05-30'),
        grade: '1',
        classroomId: classrooms[1].id,
        teacherId: teachers[1].id,
        guardians: JSON.stringify(['Ashley Williams', 'Michael Williams']),
        iepDates: JSON.stringify(['2023-11-01', '2024-05-01']),
        notes: 'Peer model in group sessions',
        isActive: true,
      },
    }),
    prisma.student.create({
      data: {
        name: 'Ava Patel',
        dateOfBirth: new Date('2018-09-12'),
        grade: 'K',
        classroomId: classrooms[0].id,
        teacherId: teachers[0].id,
        guardians: JSON.stringify(['Priya Patel', 'Raj Patel']),
        iepDates: JSON.stringify(['2024-01-15']),
        notes: 'Uses AAC device for communication',
        isActive: true,
      },
    }),
  ]);

  // Attach goals to students
  const allGoals = await prisma.goalTemplate.findMany();
  
  // Emma - Articulation focus
  await prisma.studentGoal.createMany({
    data: [
      { studentId: students[0].id, goalId: allGoals.find(g => g.goalText.includes('/s/ in initial'))!.id },
      { studentId: students[0].id, goalId: allGoals.find(g => g.goalText.includes('/s/ blends'))!.id },
      { studentId: students[0].id, goalId: allGoals.find(g => g.goalText.includes('conversation'))!.id },
    ],
  });

  // Liam - Language focus
  await prisma.studentGoal.createMany({
    data: [
      { studentId: students[1].id, goalId: allGoals.find(g => g.goalText.includes('2-step directions'))!.id },
      { studentId: students[1].id, goalId: allGoals.find(g => g.goalText.includes('5-7 word sentences'))!.id },
      { studentId: students[1].id, goalId: allGoals.find(g => g.goalText.includes('wh-questions'))!.id },
    ],
  });

  // Sophia - Phonology focus
  await prisma.studentGoal.createMany({
    data: [
      { studentId: students[2].id, goalId: allGoals.find(g => g.goalText.includes('final consonants'))!.id },
      { studentId: students[2].id, goalId: allGoals.find(g => g.goalText.includes('fronting'))!.id },
    ],
  });

  // Noah - Pragmatics focus
  await prisma.studentGoal.createMany({
    data: [
      { studentId: students[3].id, goalId: allGoals.find(g => g.goalText.includes('conversational turns'))!.id },
      { studentId: students[3].id, goalId: allGoals.find(g => g.goalText.includes('maintain topic'))!.id },
      { studentId: students[3].id, goalId: allGoals.find(g => g.goalText.includes('peer interactions'))!.id },
    ],
  });

  // Ava - AAC focus
  await prisma.studentGoal.createMany({
    data: [
      { studentId: students[4].id, goalId: allGoals.find(g => g.goalText.includes('AAC to make requests'))!.id },
      { studentId: students[4].id, goalId: allGoals.find(g => g.goalText.includes('core vocabulary on AAC'))!.id },
      { studentId: students[4].id, goalId: allGoals.find(g => g.goalText.includes('2+ words on AAC'))!.id },
    ],
  });

  // Create schedule events for the current week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
  
  const scheduleEvents = [
    // Monday
    {
      date: new Date(startOfWeek),
      startTime: '09:00',
      endTime: '09:30',
      location: 'Speech Room',
      studentIds: JSON.stringify([students[0].id]),
      teacherId: teachers[0].id,
      sessionType: 'Individual',
      status: 'Seen',
    },
    {
      date: new Date(startOfWeek),
      startTime: '09:45',
      endTime: '10:15',
      location: 'Speech Room',
      studentIds: JSON.stringify([students[1].id, students[3].id]),
      teacherId: teachers[1].id,
      sessionType: 'Group',
      status: 'Seen',
    },
    // Tuesday
    {
      date: new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 1)),
      startTime: '10:00',
      endTime: '10:30',
      location: 'Classroom',
      studentIds: JSON.stringify([students[2].id]),
      teacherId: teachers[0].id,
      classroomId: classrooms[0].id,
      sessionType: 'Individual',
      status: 'Missed',
    },
    // Wednesday
    {
      date: new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 2)),
      startTime: '09:00',
      endTime: '09:30',
      location: 'Speech Room',
      studentIds: JSON.stringify([students[0].id]),
      teacherId: teachers[0].id,
      sessionType: 'Individual',
      status: 'Upcoming',
    },
    {
      date: new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 2)),
      startTime: '13:00',
      endTime: '13:30',
      location: 'Speech Room',
      studentIds: JSON.stringify([students[4].id]),
      teacherId: teachers[0].id,
      sessionType: 'Individual',
      status: 'Upcoming',
    },
    // Thursday
    {
      date: new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 3)),
      startTime: '09:45',
      endTime: '10:15',
      location: 'Speech Room',
      studentIds: JSON.stringify([students[1].id, students[3].id]),
      teacherId: teachers[1].id,
      sessionType: 'Group',
      status: 'Upcoming',
    },
    // Friday
    {
      date: new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 4)),
      startTime: '09:00',
      endTime: '09:30',
      location: 'Speech Room',
      studentIds: JSON.stringify([students[0].id]),
      teacherId: teachers[0].id,
      sessionType: 'Individual',
      status: 'Upcoming',
    },
    {
      date: new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 4)),
      startTime: '10:00',
      endTime: '10:30',
      location: 'Speech Room',
      studentIds: JSON.stringify([students[2].id]),
      teacherId: teachers[0].id,
      sessionType: 'Individual',
      status: 'Upcoming',
    },
  ];

  for (const event of scheduleEvents) {
    await prisma.scheduleEvent.create({
      data: event,
    });
  }

  // Create some holidays
  await prisma.holiday.createMany({
    data: [
      { name: 'Winter Break', date: new Date('2024-12-23') },
      { name: 'Winter Break', date: new Date('2024-12-24') },
      { name: 'Winter Break', date: new Date('2024-12-25') },
      { name: 'Winter Break', date: new Date('2024-12-26') },
      { name: 'Winter Break', date: new Date('2024-12-27') },
      { name: 'New Year\'s Day', date: new Date('2025-01-01') },
      { name: 'MLK Day', date: new Date('2025-01-20') },
      { name: 'Presidents Day', date: new Date('2025-02-17') },
      { name: 'Spring Break', date: new Date('2025-03-24') },
      { name: 'Spring Break', date: new Date('2025-03-25') },
      { name: 'Spring Break', date: new Date('2025-03-26') },
      { name: 'Spring Break', date: new Date('2025-03-27') },
      { name: 'Spring Break', date: new Date('2025-03-28') },
    ],
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });