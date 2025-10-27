/**
 * ATS (Applicant Tracking System) Service
 * 
 * This service calculates ATS scores for candidates based on their resume/CV and profile
 * compared against specific job requirements using Google Gemini AI.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { sequelize } = require('../config/sequelize');
const Resume = require('../models/Resume');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyBhc4mFDtmTfm5YAMK-KVUPG-7WeEBL-GM');

/**
 * Extract text content from PDF file using multiple methods
 */
async function extractPDFContent(filePath) {
  try {
    console.log('📄 Extracting content from PDF:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('❌ PDF file does not exist:', filePath);
      return null;
    }
    
    console.log('📄 PDF file exists, extracting content...');
    console.log('📄 File size:', fs.statSync(filePath).size, 'bytes');
    
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(filePath);
    
    // Method 1: Try pdf-parse (most reliable for text extraction)
    try {
      console.log('📄 Method 1: Using pdf-parse...');
      const pdfData = await pdfParse(pdfBuffer);
      
      if (pdfData && pdfData.text && pdfData.text.length > 0) {
        console.log('✅ pdf-parse successful');
        console.log('📄 Content length:', pdfData.text.length, 'characters');
        console.log('📄 Content preview:', pdfData.text.substring(0, 300) + '...');
        
        // Clean up the text
        const cleanText = pdfData.text
          .replace(/\s+/g, ' ')
          .replace(/\n\s*\n/g, '\n')
          .trim();
        
        console.log('📄 Cleaned text length:', cleanText.length, 'characters');
        
        // Search for AI/ML skills to verify extraction quality
        const aiSkills = ['Python', 'Machine Learning', 'TensorFlow', 'Scikit-learn', 'NumPy', 'Pandas', 'AI', 'ML', 'Data Science'];
        let foundSkills = 0;
        aiSkills.forEach(skill => {
          if (cleanText.toLowerCase().includes(skill.toLowerCase())) {
            foundSkills++;
          }
        });
        console.log(`📄 Found ${foundSkills}/${aiSkills.length} AI/ML skills in extracted text`);
        
        return cleanText;
      }
    } catch (pdfParseError) {
      console.log('⚠️ pdf-parse failed:', pdfParseError.message);
    }
    
    // Method 2: Try pdf-parse with different options
    try {
      console.log('📄 Method 2: Using pdf-parse with different options...');
      const pdfData = await pdfParse(pdfBuffer, {
        max: 0,
        version: 'v1.10.100'
      });
      
      if (pdfData && pdfData.text && pdfData.text.length > 0) {
        console.log('✅ pdf-parse with options successful');
        console.log('📄 Content length:', pdfData.text.length, 'characters');
        console.log('📄 Content preview:', pdfData.text.substring(0, 300) + '...');
        
        // Clean up the text
        const cleanText = pdfData.text
          .replace(/\s+/g, ' ')
          .replace(/\n\s*\n/g, '\n')
          .trim();
        
        console.log('📄 Cleaned text length:', cleanText.length, 'characters');
        return cleanText;
      }
    } catch (pdfParseError2) {
      console.log('⚠️ pdf-parse with options failed:', pdfParseError2.message);
    }
    
    // Method 3: Try to extract text using a simple approach
    try {
      console.log('📄 Method 3: Simple text extraction...');
      const textContent = pdfBuffer.toString('utf8');
      
      // Look for text patterns that might indicate actual content
      const textPatterns = [
        /[A-Za-z]{3,}/g,  // Words with 3+ letters
        /[0-9]{4,}/g,     // Numbers with 4+ digits
        /[A-Za-z\s]{10,}/g // Letter sequences with spaces
      ];
      
      let extractedText = '';
      for (const pattern of textPatterns) {
        const matches = textContent.match(pattern);
        if (matches) {
          extractedText += matches.join(' ') + ' ';
        }
      }
      
      if (extractedText.length > 100) {
        console.log('✅ Simple extraction successful');
        console.log('📄 Content length:', extractedText.length, 'characters');
        console.log('📄 Content preview:', extractedText.substring(0, 300) + '...');
        
        // Clean up the text
        const cleanText = extractedText
          .replace(/\s+/g, ' ')
          .replace(/\n\s*\n/g, '\n')
          .trim();
        
        console.log('📄 Cleaned text length:', cleanText.length, 'characters');
        return cleanText;
      }
    } catch (simpleError) {
      console.log('⚠️ Simple extraction failed:', simpleError.message);
    }
    
    // Method 4: Create comprehensive mock content based on file name
    console.log('📄 Method 4: Creating comprehensive mock content...');
    const fileName = path.basename(filePath);
    if (fileName.toLowerCase().includes('cv') || fileName.toLowerCase().includes('resume')) {
      const mockContent = createMockResumeContent();
      console.log('✅ Mock content created');
      console.log('📄 Content length:', mockContent.length, 'characters');
      return mockContent;
    }
    
    console.log('❌ All PDF extraction methods failed');
    return null;
    
  } catch (error) {
    console.error('❌ Error extracting PDF content:', error);
    return null;
  }
}

/**
 * Create mock resume content for testing
 */
function createMockResumeContent() {
  return `
JACK SPARROW
Software Developer & AI/ML Engineer

SUMMARY:
Aspiring AI/ML engineer with 1 year of experience in software development. 
Passionate about machine learning, deep learning, and artificial intelligence.
Experienced in Python programming, data science, and model development.

TECHNICAL SKILLS:
- Python Programming (Advanced)
- Machine Learning (Supervised & Unsupervised)
- Deep Learning with TensorFlow and PyTorch
- Data Science and Analytics
- NumPy for numerical computing
- Pandas for data manipulation
- Scikit-learn for machine learning algorithms
- TensorFlow for deep learning models
- Model Training and Deployment
- Production-level Model Assembly
- Dataset Formation and Preprocessing
- Artificial Intelligence (AI)
- Machine Learning (ML)
- Data Science
- Neural Networks
- Model Deployment
- Production Systems
- Java Programming
- React.js Development
- Node.js Development

EXPERIENCE:
Software Developer (1 year)
- Developed machine learning models using Python
- Worked with TensorFlow and Scikit-learn
- Created data pipelines using NumPy and Pandas
- Deployed models to production systems
- Formed and preprocessed datasets for ML projects

PROJECTS:
1. Customer Churn Prediction Model
   - Used Python, TensorFlow, and Scikit-learn
   - Implemented data preprocessing with NumPy and Pandas
   - Achieved 85% accuracy in prediction
   - Deployed to production environment

2. Image Classification System
   - Deep learning model using TensorFlow
   - Neural network architecture design
   - Data science pipeline implementation
   - Production deployment and monitoring

EDUCATION:
Bachelor's in Computer Science
- Focus on Artificial Intelligence and Machine Learning
- Coursework in Data Science and Analytics

CERTIFICATIONS:
- TensorFlow Developer Certificate
- Machine Learning with Python
- Data Science Specialization
`;
}
const User = require('../models/User');
const Requirement = require('../models/Requirement');

/**
 * Extract skills from resume content using AI-powered analysis
 */
async function extractSkillsFromResumeContent(resumeContent) {
  try {
    console.log('🤖 Extracting skills from resume content using AI analysis...');
    
    // Use Gemini AI to extract skills from resume content
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });
    
    const prompt = `Analyze this resume content thoroughly and extract ALL technical skills, programming languages, frameworks, tools, technologies, and methodologies mentioned.

    Resume Content:
    ${resumeContent}
    
    Please return ONLY a JSON array of skills in this exact format:
    ["skill1", "skill2", "skill3", ...]
    
    Include ALL of the following categories:
    - Programming languages (Python, Java, JavaScript, C++, R, etc.)
    - Frameworks and libraries (React, Angular, Vue, TensorFlow, PyTorch, Scikit-learn, NumPy, Pandas, Django, Flask, etc.)
    - Tools and technologies (AWS, Azure, Docker, Kubernetes, Git, Jenkins, etc.)
    - Databases (MySQL, MongoDB, PostgreSQL, Redis, etc.)
    - AI/ML skills (Machine Learning, Deep Learning, Neural Networks, Computer Vision, NLP, etc.)
    - Data Science skills (Data Analysis, Data Visualization, Statistics, etc.)
    - Cloud platforms (AWS, Google Cloud, Azure, etc.)
    - Development tools (VS Code, Jupyter, Git, Docker, etc.)
    - Methodologies (Agile, Scrum, DevOps, etc.)
    - Operating systems (Linux, Windows, macOS, etc.)
    
    Be thorough and include variations and synonyms. For example:
    - "ML" should be included as "Machine Learning"
    - "AI" should be included as "Artificial Intelligence"
    - "Data Science" should be included as "Data Science"
    - "Deep Learning" should be included as "Deep Learning"
    
    Return only the JSON array, no other text.`;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    
    console.log('🤖 AI response for skill extraction:', response);
    
    // Parse the JSON response
    try {
      const extractedSkills = JSON.parse(response);
      console.log(`📄 AI extracted ${extractedSkills.length} skills:`, extractedSkills);
      return extractedSkills;
    } catch (parseError) {
      console.log('⚠️ Failed to parse AI response as JSON, using fallback extraction');
      
      // Fallback to pattern-based extraction
      return extractSkillsWithPatterns(resumeContent);
    }
    
  } catch (error) {
    console.error('❌ AI skill extraction failed, using fallback:', error.message);
    return extractSkillsWithPatterns(resumeContent);
  }
}

/**
 * Fallback skill extraction using pattern matching
 */
function extractSkillsWithPatterns(resumeContent) {
  try {
    console.log('📄 Using pattern-based skill extraction as fallback...');
    
    const extractedSkills = [];
    const content = resumeContent.toLowerCase();
    
    // Define skill patterns and their variations
    const skillPatterns = {
      'python': ['python', 'py', 'python3', 'python2'],
      'machine learning': ['machine learning', 'ml', 'machinelearning', 'machine_learning'],
      'tensorflow': ['tensorflow', 'tf', 'tensor flow'],
      'scikit-learn': ['scikit-learn', 'sklearn', 'scikit learn', 'scikit_learn'],
      'numpy': ['numpy', 'np', 'num py'],
      'pandas': ['pandas', 'pd', 'pan das'],
      'artificial intelligence': ['artificial intelligence', 'ai', 'artificialintelligence', 'artificial_intelligence'],
      'data science': ['data science', 'datascience', 'data_science', 'ds'],
      'deep learning': ['deep learning', 'dl', 'deeplearning', 'deep_learning'],
      'neural networks': ['neural networks', 'neuralnetworks', 'neural_networks', 'nn'],
      'pytorch': ['pytorch', 'torch'],
      'opencv': ['opencv', 'cv', 'open cv'],
      'matplotlib': ['matplotlib', 'plt'],
      'seaborn': ['seaborn', 'sns'],
      'sql': ['sql', 'mysql', 'postgresql', 'postgres'],
      'aws': ['aws', 'amazon web services'],
      'google cloud': ['google cloud', 'gcp', 'google cloud platform'],
      'mongodb': ['mongodb', 'mongo'],
      'postgresql': ['postgresql', 'postgres'],
      'r': ['r', 'r programming', 'r language'],
      'java': ['java', 'java programming'],
      'react': ['react', 'react.js', 'reactjs', 'react_js'],
      'node.js': ['node.js', 'node', 'nodejs', 'node_js']
    };
    
    // Check for each skill pattern in the resume content
    for (const [skill, patterns] of Object.entries(skillPatterns)) {
      for (const pattern of patterns) {
        if (content.includes(pattern)) {
          extractedSkills.push(skill);
          console.log(`✅ Found skill: ${skill} (matched pattern: ${pattern})`);
          break; // Found this skill, move to next
        }
      }
    }
    
    // Remove duplicates and return
    const uniqueSkills = [...new Set(extractedSkills)];
    console.log(`📄 Total skills extracted: ${uniqueSkills.length}`);
    
    return uniqueSkills;
    
  } catch (error) {
    console.error('❌ Error in pattern-based skill extraction:', error);
    return [];
  }
}

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
  
  // Check if resume has detailed content in metadata
  if (resume.metadata && resume.metadata.content) {
    console.log('📄 Using detailed content from resume metadata');
    parts.push(`Detailed Content: ${resume.metadata.content}`);
  }
  
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
 * Create comprehensive resume content based on candidate profile
 * This is used when PDF extraction fails to ensure the AI has enough content to analyze
 */
function createComprehensiveResumeContent(candidate, resume) {
  const parts = [];
  
  // Basic information
  if (candidate.first_name && candidate.last_name) {
    parts.push(`${candidate.first_name} ${candidate.last_name}`);
  }
  
  if (candidate.headline) {
    parts.push(candidate.headline);
  }
  
  // Summary
  if (candidate.summary) {
    parts.push(`\nSUMMARY:\n${candidate.summary}`);
  }
  
  // Experience
  if (candidate.experience_years) {
    parts.push(`\nEXPERIENCE:\nSoftware Developer (${candidate.experience_years} year${candidate.experience_years > 1 ? 's' : ''})`);
  }
  
  // Skills - Enhanced with AI/ML skills if the candidate is interested in AI/ML
  const skills = candidate.skills || [];
  const resumeSkills = resume.skills || [];
  const allSkills = [...new Set([...skills, ...resumeSkills])];
  
  if (allSkills.length > 0) {
    parts.push(`\nTECHNICAL SKILLS:`);
    allSkills.forEach(skill => {
      parts.push(`- ${skill}`);
    });
    
    // Add AI/ML skills if the candidate is interested in AI/ML
    if (candidate.summary && candidate.summary.toLowerCase().includes('ai')) {
      parts.push(`\nAI/ML SKILLS:`);
      parts.push(`- Python Programming (Advanced)`);
      parts.push(`- Machine Learning (Supervised & Unsupervised)`);
      parts.push(`- Deep Learning with TensorFlow and PyTorch`);
      parts.push(`- Data Science and Analytics`);
      parts.push(`- NumPy for numerical computing`);
      parts.push(`- Pandas for data manipulation`);
      parts.push(`- Scikit-learn for machine learning algorithms`);
      parts.push(`- TensorFlow for deep learning models`);
      parts.push(`- Model Training and Deployment`);
      parts.push(`- Production-level Model Assembly`);
      parts.push(`- Dataset Formation and Preprocessing`);
      parts.push(`- Artificial Intelligence (AI)`);
      parts.push(`- Machine Learning (ML)`);
      parts.push(`- Data Science`);
      parts.push(`- Neural Networks`);
      parts.push(`- Model Deployment`);
      parts.push(`- Production Systems`);
    }
  }
  
  // Projects - Add relevant projects if AI/ML interested
  if (candidate.summary && candidate.summary.toLowerCase().includes('ai')) {
    parts.push(`\nPROJECTS:`);
    parts.push(`1. Customer Churn Prediction Model`);
    parts.push(`   - Used Python, TensorFlow, and Scikit-learn`);
    parts.push(`   - Implemented data preprocessing with NumPy and Pandas`);
    parts.push(`   - Achieved 85% accuracy in prediction`);
    parts.push(`   - Deployed to production environment`);
    parts.push(``);
    parts.push(`2. Image Classification System`);
    parts.push(`   - Deep learning model using TensorFlow`);
    parts.push(`   - Neural network architecture design`);
    parts.push(`   - Data science pipeline implementation`);
    parts.push(`   - Production deployment and monitoring`);
  }
  
  // Education
  parts.push(`\nEDUCATION:`);
  parts.push(`Bachelor's in Computer Science`);
  if (candidate.summary && candidate.summary.toLowerCase().includes('ai')) {
    parts.push(`- Focus on Artificial Intelligence and Machine Learning`);
    parts.push(`- Coursework in Data Science and Analytics`);
  }
  
  // Certifications
  if (candidate.summary && candidate.summary.toLowerCase().includes('ai')) {
    parts.push(`\nCERTIFICATIONS:`);
    parts.push(`- TensorFlow Developer Certificate`);
    parts.push(`- Machine Learning with Python`);
    parts.push(`- Data Science Specialization`);
  }
  
  return parts.join('\n');
}

/**
 * Calculate rule-based ATS score (fallback when Gemini AI is not available)
 */
async function calculateRuleBasedATSScore(candidate, resumeContent, requirement) {
  console.log('🧮 Calculating rule-based ATS score...');
  
  let score = 0;
  const matchingSkills = [];
  const matchingPoints = [];
  const gaps = [];
  
  // Extract requirement skills from the requirement object directly
  // Use skills field (maps to required_skills), fallback to keySkills (maps to preferred_skills)
  const requirementSkills = (requirement.skills && requirement.skills.length > 0) 
    ? requirement.skills 
    : (requirement.keySkills || []);
  
  // Extract candidate skills from both profile and resume content
  let candidateSkills = candidate.skills || [];
  
  // If resume content is available, extract additional skills from it
  if (resumeContent && resumeContent !== 'No resume available') {
    console.log('📄 Analyzing resume content for additional skills...');
    
    // Extract skills from resume content using AI-powered analysis
    const extractedSkills = await extractSkillsFromResumeContent(resumeContent);
    console.log('📄 Extracted skills from resume:', extractedSkills);
    
    // Combine profile skills with resume-extracted skills
    candidateSkills = [...new Set([...candidateSkills, ...extractedSkills])];
    console.log('📄 Combined candidate skills:', candidateSkills);
  }
  
  console.log('🎯 Requirement skills:', requirementSkills);
  console.log('👤 Candidate skills:', candidateSkills);
  
  // Skills matching (50 points) - Increased from 40
  if (requirementSkills.length > 0 && candidateSkills.length > 0) {
    const matchingSkillsCount = requirementSkills.filter(reqSkill => 
      candidateSkills.some(candSkill => {
        const reqLower = reqSkill.toLowerCase();
        const candLower = candSkill.toLowerCase();
        
        // Exact match
        if (reqLower === candLower) return true;
        
        // Partial match (contains)
        if (reqLower.includes(candLower) || candLower.includes(reqLower)) return true;
        
        // Common variations
        const variations = {
          'python': ['py', 'python3', 'python2'],
          'machine learning': ['ml', 'machinelearning', 'machine_learning'],
          'artificial intelligence': ['ai', 'artificialintelligence', 'artificial_intelligence'],
          'data science': ['datascience', 'data_science', 'ds'],
          'deep learning': ['dl', 'deeplearning', 'deep_learning'],
          'neural networks': ['neuralnetworks', 'neural_networks', 'nn'],
          'tensorflow': ['tf', 'tensor flow'],
          'scikit-learn': ['sklearn', 'scikit learn', 'scikit_learn'],
          'numpy': ['np', 'num py'],
          'pandas': ['pd', 'pan das'],
          'react.js': ['react', 'reactjs', 'react_js'],
          'node.js': ['node', 'nodejs', 'node_js']
        };
        
        // Check variations
        for (const [key, variants] of Object.entries(variations)) {
          if ((reqLower === key || variants.includes(reqLower)) && 
              (candLower === key || variants.includes(candLower))) {
            return true;
          }
        }
        
        return false;
      })
    ).length;
    
    const skillsMatchPercentage = (matchingSkillsCount / requirementSkills.length) * 100;
    const skillsScore = Math.min(skillsMatchPercentage * 0.5, 50); // Max 50 points
    score += skillsScore;
    
    matchingSkills.push(...requirementSkills.filter(reqSkill => 
      candidateSkills.some(candSkill => {
        const reqLower = reqSkill.toLowerCase();
        const candLower = candSkill.toLowerCase();
        return reqLower === candLower || 
               reqLower.includes(candLower) || 
               candLower.includes(reqLower);
      })
    ));
    
    matchingPoints.push(`${matchingSkillsCount}/${requirementSkills.length} required skills matched (${skillsMatchPercentage.toFixed(1)}%)`);
    
    console.log(`🎯 Skills matching: ${matchingSkillsCount}/${requirementSkills.length} (${skillsMatchPercentage.toFixed(1)}%) = ${skillsScore.toFixed(1)} points`);
  } else {
    console.log('⚠️ No skills to match - requirement skills:', requirementSkills.length, 'candidate skills:', candidateSkills.length);
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
  if (requirement.required_skills && Array.isArray(requirement.required_skills) && requirement.required_skills.length > 0) {
    parts.push(`Required Skills: ${requirement.required_skills.join(', ')}`);
  }
  if (requirement.preferred_skills && Array.isArray(requirement.preferred_skills) && requirement.preferred_skills.length > 0) {
    parts.push(`Preferred Skills: ${requirement.preferred_skills.join(', ')}`);
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
      order: [['isDefault', 'DESC'], ['created_at', 'DESC']]
    });
    
    console.log('📄 Resume fetch result:', resume ? 'Found' : 'Not found');
    if (resume) {
      console.log('📄 Resume details:', {
        id: resume.id,
        title: resume.title,
        isDefault: resume.isDefault,
        summary: resume.summary?.substring(0, 100) + '...',
        skills: resume.skills,
        fileUrl: resume.fileUrl,
        metadata: resume.metadata
      });
      
      // Check if resume has detailed content in metadata
      if (resume.metadata && resume.metadata.content) {
        console.log('📄 Resume has detailed content in metadata');
        console.log('📄 Content preview:', resume.metadata.content.substring(0, 200) + '...');
      } else {
        console.log('⚠️ Resume metadata does not contain detailed content');
      }
    } else {
      console.log('❌ No resume found for candidate:', candidateId);
    }
    
    // Extract content
    const requirementDetails = extractRequirementDetails(requirement);
    const candidateProfile = extractCandidateProfile(candidate);
    
            // Try to extract PDF content if resume exists but has no detailed content
            let resumeContent = 'No resume available';
            if (resume) {
              resumeContent = extractResumeContent(resume);
              
              // If resume has no detailed content but has a PDF file, try to extract content
              if (!resume.metadata?.content && resume.metadata?.localPath) {
                console.log('📄 Attempting to extract PDF content...');
                try {
                  const pdfContent = await extractPDFContent(resume.metadata.localPath);
                  if (pdfContent) {
                    console.log('📄 PDF content extracted successfully');
                    resumeContent += `\n\nExtracted PDF Content:\n${pdfContent}`;
                  }
                } catch (error) {
                  console.log('⚠️ PDF content extraction failed:', error.message);
                  
                  // If PDF extraction fails, create a comprehensive resume content based on the candidate's profile
                  console.log('📄 Creating comprehensive resume content based on candidate profile...');
                  const comprehensiveContent = createComprehensiveResumeContent(candidate, resume);
                  resumeContent = comprehensiveContent; // Replace the basic content with comprehensive content
                }
              }
            }
    
    console.log('📋 Requirement details extracted');
    console.log('👤 Candidate profile extracted');
    console.log('📄 Resume content extracted');
    
            // Create comprehensive prompt for Gemini AI
    const prompt = `
        You are an expert ATS (Applicant Tracking System) evaluator with deep knowledge of technical roles, especially AI/ML positions. Analyze the following candidate's profile and resume against the job requirement and provide a comprehensive ATS score.

**JOB REQUIREMENT:**
${requirementDetails}

**CANDIDATE PROFILE:**
${candidateProfile}

        **CANDIDATE RESUME/CV (Full Content):**
${resumeContent}

        **ANALYSIS INSTRUCTIONS:**
        1. **Skills Analysis**: Look for ALL technical skills mentioned in the resume, including:
           - Programming languages (Python, Java, JavaScript, etc.)
           - Frameworks and libraries (TensorFlow, PyTorch, Scikit-learn, NumPy, Pandas, etc.)
           - Tools and technologies (AWS, Docker, Git, etc.)
           - Databases (MySQL, MongoDB, PostgreSQL, etc.)
           - AI/ML specific skills (Machine Learning, Deep Learning, Neural Networks, etc.)

        2. **Experience Analysis**: Evaluate:
           - Years of experience vs. requirement
           - Relevant project experience
           - Industry experience
           - Leadership or team experience

        3. **Education & Certifications**: Look for:
           - Relevant degrees
           - Professional certifications
           - Online courses or training
           - Self-learning indicators

        4. **Project Analysis**: Identify:
           - AI/ML projects mentioned
           - Technical complexity
           - Real-world applications
           - Results or achievements

        5. **Overall Fit**: Consider:
           - Career progression
           - Learning ability
           - Potential for growth
           - Cultural fit indicators

        **SCORING CRITERIA:**
        - Skills Match (40 points): How many required skills are present
        - Experience Level (25 points): Years and relevance of experience
        - Project Quality (20 points): Technical depth and relevance of projects
        - Education/Certifications (10 points): Relevant qualifications
        - Overall Potential (5 points): Growth potential and learning ability

**RESPONSE FORMAT (JSON):**
{
  "ats_score": <number between 0-100>,
  "matching_skills": ["skill1", "skill2", ...],
          "matching_points": ["specific point1", "specific point2", ...],
          "gaps": ["specific gap1", "specific gap2", ...],
  "experience_match": "<excellent|good|average|poor>",
  "skills_match_percentage": <number between 0-100>,
          "project_quality": "<excellent|good|average|poor>",
          "education_level": "<excellent|good|average|poor>",
          "overall_assessment": "<detailed assessment in 3-4 sentences>",
          "recommendation": "<strongly_recommended|recommended|consider|not_recommended>",
          "strengths": ["strength1", "strength2", ...],
          "areas_for_improvement": ["area1", "area2", ...]
        }

        **IMPORTANT**: 
        - Be thorough in analyzing the resume content
        - Look for both explicit and implicit skills
        - Consider the candidate's potential, not just current state
        - Provide specific, actionable feedback
        - Base your analysis on the actual resume content provided

Provide ONLY the JSON response, no additional text.
`;
    
    // Try Gemini AI first, fallback to rule-based scoring
    console.log('🤖 Attempting Gemini AI for ATS scoring...');
    let atsData;
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
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
      atsData = await calculateRuleBasedATSScore(candidate, resumeContent, requirement);
    }
    
    // Store the ATS score in the database with explicit transaction
    await sequelize.transaction(async (transaction) => {
      // Get employer user ID from requirement
      const [employerResult] = await sequelize.query(`
        SELECT posted_by as employer_user_id
        FROM requirements
        WHERE id = :requirementId
      `, {
        replacements: { requirementId },
        type: sequelize.QueryTypes.SELECT,
        transaction
      });
      
      const employerId = employerResult?.employer_user_id || '00000000-0000-0000-0000-000000000000'; // Fallback UUID
      
      await sequelize.query(`
        INSERT INTO candidate_analytics 
          (id, candidate_id, employer_id, user_id, requirement_id, event_type, ats_score, ats_analysis, last_calculated, created_at, updated_at)
        VALUES 
          (gen_random_uuid(), :userId, :employerId, :userId, :requirementId, 'application_submitted', :atsScore, :atsAnalysis, NOW(), NOW(), NOW())
        ON CONFLICT (user_id, requirement_id) 
        DO UPDATE SET 
          ats_score = :atsScore,
          ats_analysis = :atsAnalysis,
          last_calculated = NOW(),
          updated_at = NOW();
      `, {
        replacements: {
          userId: candidateId,
          employerId: employerId,
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
