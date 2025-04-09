import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SchoolPhilosophy from '../../models/SchoolPhilosophy.js';
import Transcript from '../../models/Transcript.js';
import CourseDescription from '../../models/CourseDescription.js';
import GradingRubric from '../../models/GradingRubric.js';

// Initialize environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateUserData() {
  let mongoConnection;
  const stats = {
    schoolProfiles: { migrated: 0, failed: 0, errors: [] },
    transcripts: { migrated: 0, failed: 0, errors: [] },
    courseDescriptions: { migrated: 0, failed: 0, errors: [] },
    gradingRubrics: { migrated: 0, failed: 0, errors: [] }
  };

  try {
    // Connect to MongoDB
    mongoConnection = await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all users from MongoDB
    const users = await mongoose.model('User').find({});
    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      try {
        // Get Supabase user ID
        const { data: supabaseUsers } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (!supabaseUsers?.id) {
          throw new Error(`No Supabase user found for email ${user.email}`);
        }

        const supabaseUserId = supabaseUsers.id;

        // 1. Migrate School Profile
        try {
          const schoolPhilosophy = await SchoolPhilosophy.findOne({ userId: user._id });
          if (schoolPhilosophy) {
            const { error } = await supabase
              .from('school_profiles')
              .upsert({
                user_id: supabaseUserId,
                prefix: schoolPhilosophy.prefix,
                first_name: schoolPhilosophy.firstName,
                middle_initial: schoolPhilosophy.middleInitial,
                last_name: schoolPhilosophy.lastName,
                title: schoolPhilosophy.title,
                phone_number: schoolPhilosophy.phoneNumber,
                fax: schoolPhilosophy.fax,
                email_address: schoolPhilosophy.emailAddress,
                profile_url: schoolPhilosophy.profileUrl,
                graduating_class_size: schoolPhilosophy.graduatingClassSize,
                block_schedule: schoolPhilosophy.blockSchedule,
                graduation_date: schoolPhilosophy.graduationDate,
                outside_us: schoolPhilosophy.outsideUs,
                volunteer_service: schoolPhilosophy.volunteerService,
                school_address: schoolPhilosophy.schoolAddress,
                one_sentence_philosophy: schoolPhilosophy.oneSentencePhilosophy,
                why_homeschool: schoolPhilosophy.whyHomeschool,
                types_of_learning: schoolPhilosophy.typesOfLearning,
                course_structure: schoolPhilosophy.courseStructure,
                success_measurement: schoolPhilosophy.successMeasurement,
                extracurricular_opportunities: schoolPhilosophy.extracurricularOpportunities,
                ai_philosophy: schoolPhilosophy.aiPhilosophy
              });

            if (error) throw error;
            stats.schoolProfiles.migrated++;
          }
        } catch (error) {
          console.error(`Failed to migrate school profile for ${user.email}:`, error);
          stats.schoolProfiles.failed++;
          stats.schoolProfiles.errors.push({ email: user.email, error: error.message });
        }

        // 2. Migrate Transcript
        try {
          const transcript = await Transcript.findOne({ userId: user._id });
          if (transcript) {
            const formatDate = (date) => date ? new Date(date).toISOString() : null;

            const { error } = await supabase
              .from('transcripts')
              .upsert({
                user_id: supabaseUserId,
                name: transcript.name,
                gender: transcript.gender,
                address: transcript.address,
                city: transcript.city,
                state: transcript.state,
                zip: transcript.zip,
                dob: formatDate(transcript.dob),
                parent_guardian: transcript.parentGuardian,
                student_email: transcript.studentEmail,
                projected_grad_date: formatDate(transcript.projectedGradDate),
                parent_email: transcript.parentEmail,
                school_name: transcript.schoolName,
                school_phone: transcript.schoolPhone,
                school_address: transcript.schoolAddress,
                school_city: transcript.schoolCity,
                school_state: transcript.schoolState,
                school_zip: transcript.schoolZip,
                issue_date: formatDate(transcript.issueDate),
                graduation_date: formatDate(transcript.graduationDate),
                freshman_year: transcript.freshmanYear,
                sophomore_year: transcript.sophomoreYear,
                junior_year: transcript.juniorYear,
                senior_year: transcript.seniorYear,
                pre_high_school_year: transcript.preHighSchoolYear,
                freshman_courses: transcript.freshmanCourses || [],
                sophomore_courses: transcript.sophomoreCourses || [],
                junior_courses: transcript.juniorCourses || [],
                senior_courses: transcript.seniorCourses || [],
                pre_high_school_courses: transcript.preHighSchoolCourses || [],
                cumulative_summary: transcript.cumulativeSummary,
                test_scores: transcript.testScores,
                grading_scale: transcript.gradingScale,
                miscellaneous: transcript.miscellaneous,
                signature_date: formatDate(transcript.signatureDate)
              });

            if (error) throw error;
            stats.transcripts.migrated++;
          }
        } catch (error) {
          console.error(`Failed to migrate transcript for ${user.email}:`, error);
          stats.transcripts.failed++;
          stats.transcripts.errors.push({ email: user.email, error: error.message });
        }

        // 3. Migrate Course Descriptions
        try {
          const courseDescription = await CourseDescription.findOne({ userId: user._id });
          if (courseDescription) {
            const { error } = await supabase
              .from('course_descriptions')
              .upsert({
                user_id: supabaseUserId,
                freshman: courseDescription.freshman || [],
                sophomore: courseDescription.sophomore || [],
                junior: courseDescription.junior || [],
                senior: courseDescription.senior || []
              });

            if (error) throw error;
            stats.courseDescriptions.migrated++;
          }
        } catch (error) {
          console.error(`Failed to migrate course descriptions for ${user.email}:`, error);
          stats.courseDescriptions.failed++;
          stats.courseDescriptions.errors.push({ email: user.email, error: error.message });
        }

        // 4. Migrate Grading Rubric
        try {
          const gradingRubric = await GradingRubric.findOne({ userId: user._id });
          if (gradingRubric) {
            const { error } = await supabase
              .from('grading_rubrics')
              .upsert({
                user_id: supabaseUserId,
                evaluation_method: gradingRubric.evaluationMethod,
                learning_goals: gradingRubric.learningGoals,
                assignments: gradingRubric.assignments,
                grading_scale: gradingRubric.gradingScale,
                ai_grading_scale: gradingRubric.aiGradingScale
              });

            if (error) throw error;
            stats.gradingRubrics.migrated++;
          }
        } catch (error) {
          console.error(`Failed to migrate grading rubric for ${user.email}:`, error);
          stats.gradingRubrics.failed++;
          stats.gradingRubrics.errors.push({ email: user.email, error: error.message });
        }

      } catch (error) {
        console.error(`Failed to process user ${user.email}:`, error);
      }
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (mongoConnection) {
      await mongoConnection.client.close();
      console.log('MongoDB connection closed');
    }

    // Print final statistics
    console.log('\nMigration completed:');
    console.log('School Profiles:', stats.schoolProfiles);
    console.log('Transcripts:', stats.transcripts);
    console.log('Course Descriptions:', stats.courseDescriptions);
    console.log('Grading Rubrics:', stats.gradingRubrics);
  }
}

// Run the migration
migrateUserData().catch(console.error); 