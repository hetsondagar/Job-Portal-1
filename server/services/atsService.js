/**
 * ATS (Applicant Tracking System) Service
 * 
 * This service calculates ATS scores for candidates based on their resume/CV and profile
 * compared against specific job requirements using Google Gemini AI.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { sequelize } = require('../config/sequelize');
const Resume = require('../models/Resume');
const User = require('../models/User');
const Requirement = require('../models/Requirement');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract text content from resume
 */
function extractResumeContent(resume) {
  if (!resume) return '';
  
  const parts = [];
  
  // Basic resume information
  if (resume.title) parts.push(`Title: ${resume.title}`);
  if (resume.summary) parts.push(`Summary: ${resume.summary}`);
  if (resume.objective) parts.push(`Objective: ${resume.objective}`);
  
  // Skills
  if (resume.skills && Array.isArray(resume.skills) && resume.skills.length > 0) {
    parts.push(`Skills: ${resume.skills.join(', ')}`);
  }
  
  // Languages
  if (resume.languages && Array.isArray(resume.languages) && resume.languages.length > 0) {
    const langList = resume.languages.map(l => `${l.name || l} (${l.proficiency || 'Not specified'})`).join(', ');
    parts.push(`Languages: ${langList}`);
  }
  
  // Certifications
  if (resume.certifications && Array.isArray(resume.certifications) && resume.certifications.length > 0) {
    const certList = resume.certifications.map(c => 
      `${c.name || c} - ${c.issuer || 'Unknown issuer'} (${c.year || 'N/A'})`
    ).join(', ');
    parts.push(`Certifications: ${certList}`);
  }
  
  // Projects
  if (resume.projects && Array.isArray(resume.projects) && resume.projects.length > 0) {
    const projectList = resume.projects.map(p => 
      `${p.name || p}: ${p.description || 'No description'}`
    ).join(', ');
    parts.push(`Projects: ${projectList}`);
  }
  
  // Achievements
  if (resume.achievements && Array.isArray(resume.achievements) && resume.achievements.length > 0) {
    parts.push(`Achievements: ${resume.achievements.join(', ')}`);
  }
  
  return parts.join('\n\n');
}

/**
 * Extract candidate profile information
 */
function extractCandidateProfile(user) {
  if (!user) return '';
  
  const parts = [];
  
  // Basic information
  if (user.first_name && user.last_name) {
    parts.push(`Name: ${user.first_name} ${user.last_name}`);
  }
  if (user.email) parts.push(`Email: ${user.email}`);
  if (user.phone) parts.push(`Phone: ${user.phone}`);
  if (user.headline) parts.push(`Headline: ${user.headline}`);
  if (user.summary) parts.push(`Summary: ${user.summary}`);
  if (user.current_location) parts.push(`Location: ${user.current_location}`);
  
  // Professional details
  if (user.experience_years) parts.push(`Experience: ${user.experience_years} years`);
  if (user.current_salary) parts.push(`Current Salary: ${user.current_salary}`);
  if (user.expected_salary) parts.push(`Expected Salary: ${user.expected_salary}`);
  if (user.notice_period) parts.push(`Notice Period: ${user.notice_period} days`);
  
  // Skills
  if (user.skills && Array.isArray(user.skills) && user.skills.length > 0) {
    parts.push(`Profile Skills: ${user.skills.join(', ')}`);
  }
  
  // Preferred locations
  if (user.preferred_locations && Array.isArray(user.preferred_locations) && user.preferred_locations.length > 0) {
    parts.push(`Preferred Locations: ${user.preferred_locations.join(', ')}`);
  }
  
  return parts.join('\n');
}

/**
 * Extract requirement details
 */
function extractRequirementDetails(requirement) {
  if (!requirement) return '';
  
  const parts = [];
  
  // Basic information
  if (requirement.title) parts.push(`Job Title: ${requirement.title}`);
  if (requirement.description) parts.push(`Description: ${requirement.description}`);
  if (requirement.job_type) parts.push(`Job Type: ${requirement.job_type}`);
  if (requirement.experience_required) parts.push(`Experience Required: ${requirement.experience_required}`);
  if (requirement.location) parts.push(`Location: ${requirement.location}`);
  
  // Skills and qualifications
  if (requirement.skills_required && Array.isArray(requirement.skills_required) && requirement.skills_required.length > 0) {
    parts.push(`Required Skills: ${requirement.skills_required.join(', ')}`);
  }
  if (requirement.qualifications && Array.isArray(requirement.qualifications) && requirement.qualifications.length > 0) {
    parts.push(`Qualifications: ${requirement.qualifications.join(', ')}`);
  }
  
  // Salary and other details
  if (requirement.salary_min && requirement.salary_max) {
    parts.push(`Salary Range: ${requirement.salary_min} - ${requirement.salary_max}`);
  }
  if (requirement.department) parts.push(`Department: ${requirement.department}`);
  if (requirement.employment_type) parts.push(`Employment Type: ${requirement.employment_type}`);
  
  return parts.join('\n');
}

/**
 * Calculate ATS score using Gemini AI
 */
async function calculateATSScore(candidateId, requirementId) {
  try {
    console.log(`🔍 Calculating ATS score for candidate ${candidateId} against requirement ${requirementId}`);
    
    // Fetch requirement details
    const requirement = await Requirement.findByPk(requirementId);
    if (!requirement) {
      throw new Error('Requirement not found');
    }
    
    // Fetch candidate details
    const candidate = await User.findByPk(candidateId, {
      attributes: [
        'id', 'first_name', 'last_name', 'email', 'phone', 'headline', 
        'summary', 'current_location', 'experience_years', 'current_salary', 
        'expected_salary', 'notice_period', 'skills', 'preferred_locations'
      ]
    });
    
    if (!candidate) {
      throw new Error('Candidate not found');
    }
    
    // Fetch candidate's resume
    const resume = await Resume.findOne({
      where: { userId: candidateId },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });
    
    // Extract content
    const requirementDetails = extractRequirementDetails(requirement);
    const candidateProfile = extractCandidateProfile(candidate);
    const resumeContent = resume ? extractResumeContent(resume) : 'No resume available';
    
    console.log('📋 Requirement details extracted');
    console.log('👤 Candidate profile extracted');
    console.log('📄 Resume content extracted');
    
    // Create prompt for Gemini AI
    const prompt = `
You are an expert ATS (Applicant Tracking System) evaluator. Analyze the following candidate's profile and resume against the job requirement and provide a detailed ATS score.

**JOB REQUIREMENT:**
${requirementDetails}

**CANDIDATE PROFILE:**
${candidateProfile}

**CANDIDATE RESUME/CV:**
${resumeContent}

**INSTRUCTIONS:**
1. Analyze how well the candidate matches the job requirement
2. Consider skills match, experience level, qualifications, and overall fit
3. Provide an ATS score from 0-100 (where 100 is a perfect match)
4. List specific matching points (skills, experience, qualifications that align)
5. List gaps or missing requirements
6. Provide a brief overall assessment

**RESPONSE FORMAT (JSON):**
{
  "ats_score": <number between 0-100>,
  "matching_skills": ["skill1", "skill2", ...],
  "matching_points": ["point1", "point2", ...],
  "gaps": ["gap1", "gap2", ...],
  "experience_match": "<excellent|good|average|poor>",
  "skills_match_percentage": <number between 0-100>,
  "overall_assessment": "<brief assessment in 2-3 sentences>",
  "recommendation": "<strongly_recommended|recommended|consider|not_recommended>"
}

Provide ONLY the JSON response, no additional text.
`;
    
    // Call Gemini AI
    console.log('🤖 Calling Gemini AI for ATS scoring...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini AI response received');
    
    // Parse the JSON response
    let atsData;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        atsData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('❌ Error parsing Gemini response:', parseError);
      console.log('Raw response:', text);
      
      // Fallback: Create default score
      atsData = {
        ats_score: 50,
        matching_skills: [],
        matching_points: ['Unable to fully analyze - using default score'],
        gaps: ['AI response parsing failed'],
        experience_match: 'average',
        skills_match_percentage: 50,
        overall_assessment: 'Unable to generate detailed assessment. Please try again.',
        recommendation: 'consider'
      };
    }
    
    // Store the ATS score in the database
    await sequelize.query(`
      INSERT INTO candidate_analytics 
        (user_id, requirement_id, ats_score, ats_analysis, last_calculated, "createdAt", "updatedAt")
      VALUES 
        (:userId, :requirementId, :atsScore, :atsAnalysis, NOW(), NOW(), NOW())
      ON CONFLICT (user_id, requirement_id) 
      DO UPDATE SET 
        ats_score = :atsScore,
        ats_analysis = :atsAnalysis,
        last_calculated = NOW(),
        "updatedAt" = NOW();
    `, {
      replacements: {
        userId: candidateId,
        requirementId: requirementId,
        atsScore: atsData.ats_score,
        atsAnalysis: JSON.stringify(atsData)
      }
    });
    
    console.log(`✅ ATS score ${atsData.ats_score} saved for candidate ${candidateId}`);
    
    return {
      candidateId,
      requirementId,
      atsScore: atsData.ats_score,
      analysis: atsData,
      calculatedAt: new Date()
    };
    
  } catch (error) {
    console.error('❌ Error calculating ATS score:', error);
    throw error;
  }
}

/**
 * Calculate ATS scores for multiple candidates (batch processing)
 */
async function calculateBatchATSScores(candidateIds, requirementId, onProgress) {
  const results = [];
  const errors = [];
  
  console.log(`🚀 Starting batch ATS calculation for ${candidateIds.length} candidates`);
  
  for (let i = 0; i < candidateIds.length; i++) {
    const candidateId = candidateIds[i];
    
    try {
      // Call progress callback
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: candidateIds.length,
          candidateId,
          status: 'processing'
        });
      }
      
      // Calculate ATS score
      const result = await calculateATSScore(candidateId, requirementId);
      results.push(result);
      
      // Call progress callback
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: candidateIds.length,
          candidateId,
          status: 'completed',
          score: result.atsScore
        });
      }
      
      // Add delay to avoid rate limiting (1 second between requests)
      if (i < candidateIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`❌ Error processing candidate ${candidateId}:`, error);
      errors.push({
        candidateId,
        error: error.message
      });
      
      // Call progress callback
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: candidateIds.length,
          candidateId,
          status: 'error',
          error: error.message
        });
      }
    }
  }
  
  console.log(`✅ Batch ATS calculation completed: ${results.length} successful, ${errors.length} errors`);
  
  return {
    successful: results,
    errors,
    total: candidateIds.length
  };
}

/**
 * Get ATS score for a candidate
 */
async function getATSScore(candidateId, requirementId) {
  try {
    const [result] = await sequelize.query(`
      SELECT 
        user_id as "userId",
        requirement_id as "requirementId",
        ats_score as "atsScore",
        ats_analysis as "atsAnalysis",
        last_calculated as "lastCalculated"
      FROM candidate_analytics
      WHERE user_id = :userId AND requirement_id = :requirementId
      LIMIT 1;
    `, {
      replacements: { userId: candidateId, requirementId },
      type: sequelize.QueryTypes.SELECT
    });
    
    if (!result || result.length === 0) {
      return null;
    }
    
    return {
      candidateId: result.userId,
      requirementId: result.requirementId,
      atsScore: result.atsScore,
      analysis: typeof result.atsAnalysis === 'string' ? JSON.parse(result.atsAnalysis) : result.atsAnalysis,
      calculatedAt: result.lastCalculated
    };
  } catch (error) {
    console.error('❌ Error fetching ATS score:', error);
    return null;
  }
}

module.exports = {
  calculateATSScore,
  calculateBatchATSScores,
  getATSScore
};
