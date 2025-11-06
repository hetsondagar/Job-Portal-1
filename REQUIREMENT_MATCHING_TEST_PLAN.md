# Production-Level Requirement Matching Test Plan

## Overview
This document outlines comprehensive test cases for requirement creation and candidate matching across different domains (Software, AI, Mechanical, Instrumentation).

## Test Cases

### Test Case 1: Software Developer Requirement
**Requirement Details:**
- Title: "Full Stack Developer"
- Skills: ["JavaScript", "React", "Node.js", "PostgreSQL"]
- Experience: 3-7 years
- Salary: 8-15 LPA
- Location: ["Bangalore", "Mumbai"]
- Education: "Bachelor's in Computer Science"
- Designation: ["Software Developer", "Full Stack Developer"]
- Notice Period: "30 days"
- Remote Work: "hybrid"

**Expected Candidates:**
- Must have at least ONE of: JavaScript, React, Node.js, PostgreSQL in skills/key_skills/headline
- Experience between 3-7 years
- Salary between 8-15 LPA (or not mentioned if includeNotMentioned=true)
- Location in Bangalore or Mumbai OR willing_to_relocate=true
- Headline/designation contains "Software Developer" or "Full Stack Developer"
- Notice period <= 30 days
- Education contains "Computer Science" or "Bachelor"

**Verification:**
1. Check database for candidates matching ALL criteria
2. Verify no irrelevant candidates (e.g., PHP developers, 10 years experience, 20 LPA)
3. Verify candidates with matching skills but different locations are excluded (unless willing_to_relocate)
4. Verify candidates outside experience range are excluded

---

### Test Case 2: AI/ML Engineer Requirement
**Requirement Details:**
- Title: "Machine Learning Engineer"
- Skills: ["Python", "TensorFlow", "PyTorch", "Deep Learning"]
- Experience: 2-5 years
- Salary: 10-20 LPA
- Location: ["Hyderabad", "Bangalore"]
- Education: "Master's in Data Science" or "Bachelor's in Computer Science"
- Designation: ["ML Engineer", "Data Scientist", "AI Engineer"]
- Institute: "IIT" or "IIIT"
- Current Company: ["Google", "Microsoft", "Amazon"]
- Resume Freshness: Last 6 months
- Last Active: Last 30 days

**Expected Candidates:**
- Must have at least ONE of: Python, TensorFlow, PyTorch, Deep Learning
- Experience between 2-5 years
- Salary between 10-20 LPA
- Location in Hyderabad or Bangalore
- Education contains "Data Science" or "Computer Science" or "Master"
- Institute contains "IIT" or "IIIT"
- Current company contains "Google" or "Microsoft" or "Amazon"
- Resume updated in last 6 months
- Last login within 30 days
- Headline contains "Machine Learning" or "ML" or "AI"

**Verification:**
1. Check database for candidates matching ALL criteria
2. Verify candidates with old resumes (7+ months) are excluded
3. Verify candidates inactive for 31+ days are excluded
4. Verify candidates without IIT/IIIT are excluded
5. Verify candidates not from target companies are excluded

---

### Test Case 3: Mechanical Engineer Requirement
**Requirement Details:**
- Title: "Mechanical Design Engineer"
- Skills: ["AutoCAD", "SolidWorks", "CATIA", "GD&T"]
- Experience: 4-8 years
- Salary: 6-12 LPA
- Location: ["Pune", "Chennai"]
- Education: "Bachelor's in Mechanical Engineering"
- Designation: ["Mechanical Engineer", "Design Engineer"]
- Current Company: ["TATA", "Mahindra"]
- Notice Period: "60 days"
- Willing to Relocate: true

**Expected Candidates:**
- Must have at least ONE of: AutoCAD, SolidWorks, CATIA, GD&T
- Experience between 4-8 years
- Salary between 6-12 LPA
- Location in Pune or Chennai OR willing_to_relocate=true
- Education contains "Mechanical Engineering"
- Current company contains "TATA" or "Mahindra"
- Notice period <= 60 days
- Headline contains "Mechanical" or "Design"

**Verification:**
1. Check database for candidates matching ALL criteria
2. Verify candidates from other cities but willing to relocate are included
3. Verify candidates without mechanical engineering background are excluded
4. Verify candidates without CAD software skills are excluded

---

### Test Case 4: Instrumentation Engineer Requirement
**Requirement Details:**
- Title: "Instrumentation Engineer"
- Skills: ["PLC", "SCADA", "DCS", "HMI"]
- Experience: 3-6 years
- Salary: 5-10 LPA
- Location: ["Ahmedabad", "Vadodara"]
- Education: "Bachelor's in Instrumentation Engineering" or "Bachelor's in Electronics Engineering"
- Designation: ["Instrumentation Engineer", "Control Engineer"]
- Current Company: ["ABB", "Siemens", "Emerson"]
- Notice Period: "30 days"
- Remote Work: "on-site"

**Expected Candidates:**
- Must have at least ONE of: PLC, SCADA, DCS, HMI
- Experience between 3-6 years
- Salary between 5-10 LPA
- Location in Ahmedabad or Vadodara
- Education contains "Instrumentation" or "Electronics Engineering"
- Current company contains "ABB" or "Siemens" or "Emerson"
- Notice period <= 30 days
- Headline contains "Instrumentation" or "Control"

**Verification:**
1. Check database for candidates matching ALL criteria
2. Verify candidates without PLC/SCADA skills are excluded
3. Verify candidates from non-target companies are excluded
4. Verify candidates with notice period > 30 days are excluded

---

## Edge Cases

### Edge Case 1: Empty Fields
- Create requirement with only title and skills
- Verify candidates match based on available criteria only
- Verify no errors occur

### Edge Case 2: All Fields Filled
- Create requirement with ALL fields filled
- Verify candidates match ALL criteria (AND logic)
- Verify very few or no candidates if criteria are too strict

### Edge Case 3: Overlapping Ranges
- Experience: 5-10 years, Salary: 8-15 LPA
- Verify candidates within both ranges are included
- Verify candidates outside either range are excluded

### Edge Case 4: Multiple Locations
- Location: ["Bangalore", "Mumbai", "Pune"]
- Verify candidates from ANY of these locations are included
- Verify candidates from other locations are excluded (unless willing_to_relocate)

### Edge Case 5: Multiple Skills
- Skills: ["JavaScript", "React", "Node.js", "Python", "Django"]
- Verify candidates with AT LEAST ONE skill are included
- Verify candidates with NONE of these skills are excluded

### Edge Case 6: Title Matching
- Title: "Senior Software Engineer"
- Verify candidates with "Senior Software Engineer" in headline are prioritized
- Verify candidates without title keywords are excluded (if strict criteria exist)

### Edge Case 7: Salary Not Mentioned
- Salary: 8-15 LPA, includeNotMentioned: true
- Verify candidates with salary 8-15 LPA are included
- Verify candidates with no salary mentioned are also included

### Edge Case 8: Edit Requirement
- Create requirement with criteria A
- Edit to change criteria to B
- Verify candidates update to match new criteria B
- Verify old candidates (matching A but not B) are excluded

---

## Access Count Testing

### Test Case: View Profile and Verify Access Count
1. Create requirement and note initial accessed count (should be 0)
2. View candidate profile from `/employer-dashboard/requirements/[id]/candidates/[candidateId]`
3. Return to `/employer-dashboard/requirements/[id]/candidates`
4. Verify candidate shows as "viewed" (tick mark)
5. Check `/employer-dashboard/requirements/` page
6. Verify accessed count incremented by 1
7. View another candidate profile
8. Verify accessed count incremented by 2
9. View same candidate again
10. Verify accessed count stays at 2 (not incremented for duplicate views)

---

## Database Verification Queries

### Query 1: Verify Requirement Metadata Storage
```sql
SELECT id, title, metadata 
FROM requirements 
WHERE id = '<requirement_id>';
-- Verify all fields are stored in metadata JSONB
```

### Query 2: Verify Candidate Matching
```sql
-- Get candidates matching requirement criteria
SELECT u.id, u.first_name, u.last_name, u.headline, u.experience_years, 
       u.current_salary, u.current_location, u.skills, u.key_skills
FROM users u
WHERE u.user_type = 'jobseeker'
  AND u.is_active = true
  AND u.account_status = 'active'
  AND u.experience_years BETWEEN 3 AND 7
  AND u.current_salary BETWEEN 8 AND 15
  AND (u.current_location ILIKE '%Bangalore%' OR u.current_location ILIKE '%Mumbai%')
  AND (
    u.skills @> '["JavaScript"]'::jsonb OR
    u.skills @> '["React"]'::jsonb OR
    u.key_skills @> '["JavaScript"]'::jsonb OR
    u.headline ILIKE '%JavaScript%' OR
    u.headline ILIKE '%React%'
  );
```

### Query 3: Verify View Tracking
```sql
-- Check views for a requirement
SELECT vt.*, u.first_name, u.last_name
FROM view_tracking vt
JOIN users u ON vt.viewed_user_id = u.id
WHERE vt.job_id = '<requirement_id>'
  AND vt.viewer_id = '<employer_id>'
  AND vt.view_type = 'profile_view';
```

---

## Automated Test Script

Run the following test scenarios:

1. **Create Software Requirement** → Verify 5-10 relevant candidates
2. **Create AI Requirement** → Verify 2-5 relevant candidates
3. **Create Mechanical Requirement** → Verify 3-8 relevant candidates
4. **Create Instrumentation Requirement** → Verify 2-6 relevant candidates
5. **Edit Requirement** → Verify candidates update correctly
6. **View Profile** → Verify access count increments
7. **Multiple Views** → Verify access count increments correctly
8. **Empty Fields** → Verify no errors, candidates match available criteria
9. **Strict Criteria** → Verify very few candidates (expected)
10. **Lenient Criteria** → Verify more candidates (expected)

---

## Success Criteria

✅ All test cases pass
✅ No irrelevant candidates in results
✅ Access count increments correctly
✅ Stats endpoint matches candidates endpoint count
✅ All fields from create-requirement are used in matching
✅ Edge cases handled correctly
✅ No errors in console
✅ Database queries return expected results


