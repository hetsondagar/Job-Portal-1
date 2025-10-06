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
 * Calculate rule-based ATS score (fallback when Gemini AI is not available)
 */
function calculateRuleBasedATSScore(candidate, resumeContent, requirement) {
  console.log('🧮 Calculating rule-based ATS score...');
  
  let score = 0;
  const matchingSkills = [];
  const matchingPoints = [];
  const gaps = [];
  
  // Extract requirement skills from the requirement object directly
  // Use skills field if keySkills is empty, as skills contains the actual requirements
  const requirementSkills = (requirement.keySkills && requirement.keySkills.length > 0) 
    ? requirement.keySkills 
    : (requirement.skills || []);
  const candidateSkills = candidate.skills || [];
  
  // Skills matching (40 points)
  if (requirementSkills.length > 0 && candidateSkills.length > 0) {
    const matchingSkillsCount = requirementSkills.filter(reqSkill => 
      candidateSkills.some(candSkill => 
        candSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(candSkill.toLowerCase())
      )
    ).length;
    
    const skillsMatchPercentage = (matchingSkillsCount / requirementSkills.length) * 100;
    const skillsScore = Math.min(skillsMatchPercentage * 0.4, 40); // Max 40 points
    score += skillsScore;
    
    matchingSkills.push(...requirementSkills.filter(reqSkill => 
      candidateSkills.some(candSkill => 
        candSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(candSkill.toLowerCase())
      )
    ));
    
    matchingPoints.push(`${matchingSkillsCount}/${requirementSkills.length} required skills matched (${skillsMatchPercentage.toFixed(1)}%)`);
  }
  
  // Experience matching (25 points)
  const requiredExpMin = requirement.experienceMin || 0;
  const requiredExpMax = requirement.experienceMax || 10;
  const candidateExp = candidate.experience_years || 0;
  
  // Only give full experience points if there's actually an experience requirement
  if (requiredExpMin > 0 || requiredExpMax < 10) {
    if (candidateExp >= requiredExpMin && candidateExp <= requiredExpMax) {
      score += 25;
      matchingPoints.push(`Experience matches requirement (${candidateExp} years)`);
    } else if (candidateExp > requiredExpMax) {
      score += 20;
      matchingPoints.push(`Experience exceeds requirement (${candidateExp} years)`);
    } else if (candidateExp > 0) {
      const expScore = Math.max(0, 25 * (candidateExp / requiredExpMin));
      score += expScore;
      matchingPoints.push(`Experience partially matches (${candidateExp} years)`);
      gaps.push(`Experience below requirement (${candidateExp} vs ${requiredExpMin}+ years)`);
    } else {
      gaps.push('No experience specified');
    }
  } else {
    // No specific experience requirement - give partial points for any experience
    if (candidateExp > 0) {
      score += 15; // Reduced points when no specific requirement
      matchingPoints.push(`Has experience (${candidateExp} years)`);
    } else {
      gaps.push('No experience specified');
    }
  }
  
  // Location matching (15 points)
  const requiredLocations = requirement.candidateLocations || [];
  const candidateLocation = candidate.current_location || '';
  const candidatePreferredLocations = candidate.preferred_locations || [];
  
  if (requiredLocations.length > 0) {
    const locationMatches = requiredLocations.some(reqLoc => 
      candidateLocation.toLowerCase().includes(reqLoc.toLowerCase()) ||
      candidatePreferredLocations.some(prefLoc => 
        prefLoc.toLowerCase().includes(reqLoc.toLowerCase())
      )
    );
    
    if (locationMatches) {
      score += 15;
      matchingPoints.push('Location matches requirement');
    } else {
      gaps.push('Location does not match requirement');
    }
  }
  
  // Education matching (10 points)
  // For now, assume no education data is available in the user model
  // This could be enhanced to check resume education data
  gaps.push('No education information provided');
  
  // Resume content quality (10 points)
  if (resumeContent && resumeContent.length > 200) {
    score += 10;
    matchingPoints.push('Detailed resume content available');
  } else if (resumeContent && resumeContent.length > 50) {
    score += 5; // Partial points for some content
    matchingPoints.push('Basic resume content available');
  } else {
    gaps.push('Limited resume content');
  }
  
  // Ensure score is between 0-100
  score = Math.min(Math.max(score, 0), 100);
  
  // Determine experience match level
  let experienceMatch = 'poor';
  if (candidateExp >= requiredExpMin && candidateExp <= requiredExpMax) {
    experienceMatch = 'excellent';
  } else if (candidateExp > requiredExpMax) {
    experienceMatch = 'good';
  } else if (candidateExp > requiredExpMin * 0.7) {
    experienceMatch = 'average';
  }
  
  // Determine recommendation
  let recommendation = 'not_recommended';
  if (score >= 80) {
    recommendation = 'strongly_recommended';
  } else if (score >= 60) {
    recommendation = 'recommended';
  } else if (score >= 40) {
    recommendation = 'consider';
  }
  
  return {
    ats_score: Math.round(score),
    matching_skills: matchingSkills,
    matching_points: matchingPoints,
    gaps: gaps,
    experience_match: experienceMatch,
    skills_match_percentage: Math.round((matchingSkills.length / Math.max(requirementSkills.length, 1)) * 100),
    overall_assessment: `Rule-based ATS score: ${Math.round(score)}/100. ${matchingPoints.length > 0 ? 'Strengths: ' + matchingPoints.slice(0, 2).join(', ') + '.' : ''} ${gaps.length > 0 ? 'Areas for improvement: ' + gaps.slice(0, 2).join(', ') + '.' : ''}`,
    recommendation: recommendation
  };
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
  if (requirement.keySkills && Array.isArray(requirement.keySkills) && requirement.keySkills.length > 0) {
    parts.push(`Required Skills: ${requirement.keySkills.join(', ')}`);
  }
  if (requirement.skills && Array.isArray(requirement.skills) && requirement.skills.length > 0) {
    parts.push(`Additional Skills: ${requirement.skills.join(', ')}`);
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
    
    // Try Gemini AI first, fallback to rule-based scoring
    console.log('🤖 Attempting Gemini AI for ATS scoring...');
    let atsData;
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        }
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Gemini AI response received');
      
      // Parse the JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        atsData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
      
    } catch (geminiError) {
      console.log('⚠️ Gemini AI failed, using rule-based scoring:', geminiError.message);
      
      // Fallback: Use rule-based ATS scoring
      // Pass the actual candidate object, not the extracted text
      atsData = calculateRuleBasedATSScore(candidate, resumeContent, requirement);
    }
    
    // Store the ATS score in the database with explicit transaction
    await sequelize.transaction(async (transaction) => {
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
        },
        transaction
      });
    });
    
    // Verify the score was saved by querying it back
    const [verification] = await sequelize.query(`
      SELECT ats_score, last_calculated 
      FROM candidate_analytics 
      WHERE user_id = :userId AND requirement_id = :requirementId
    `, {
      replacements: { userId: candidateId, requirementId: requirementId },
      type: sequelize.QueryTypes.SELECT
    });
    
    if (verification && verification.ats_score === atsData.ats_score) {
      console.log(`✅ ATS score ${atsData.ats_score} verified and saved for candidate ${candidateId}`);
    } else {
      console.log(`⚠️ ATS score verification failed for candidate ${candidateId}`);
    }
    
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
        await new Promise(resolve => setTimeout(resolve, 1500)); // Increased delay for database commits
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
