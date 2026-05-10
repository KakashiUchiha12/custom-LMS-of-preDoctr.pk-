/**
 * Analyze how the mapping script is matching MCQs to lessons
 * and diagnose why "Board Book Based MCQs KPK" has 360 entries.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const fs = require('fs');

function normalizeText(str) {
  if (!str) return '';
  return str
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}]/gu, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Load the course map and find Biodiversity lessons
const courseMap = JSON.parse(fs.readFileSync(path.join(__dirname, '../../public/course_map.json'), 'utf8'));
const bio = courseMap.find(c => c.title.toLowerCase().includes('biology'));
const biodiversityChapter = bio?.topics?.find(t => t.title.toLowerCase().includes('biodiversity'));

if (!biodiversityChapter) {
  console.log('Could not find Biodiversity chapter');
  process.exit(1);
}

const lessons = biodiversityChapter.lessons || [];
console.log('\n=== Biodiversity Lessons ===');
lessons.forEach(l => {
  console.log(`  "${l.title}"  =>  normalized: "${normalizeText(l.title)}"`);
});

// Now read the SQL and find all MCQ chapter strings for Biodiversity
const sqlContent = fs.readFileSync(path.join(__dirname, '../../public/freemdcat_wp323.sql'), 'utf8');
const sqlLines = sqlContent.split('\n');

// Extract all MCQ category/chapter strings that contain "Biodiversity"
const biodivLines = sqlLines.filter(l => l.toLowerCase().includes('biodiversity') && l.includes('wp_quizzes'));
console.log('\n=== Sample MCQ chapter strings for Biodiversity ===');
biodivLines.slice(0, 5).forEach(l => console.log(l.substring(0, 300)));

// Find all distinct chapter strings in the MCQ rows
const chapterStrings = new Set();
sqlLines.forEach(line => {
  // MCQ rows look like INSERT INTO wp_quizzes VALUES (id, ...)
  if (line.includes('wp_quizzes') && line.toLowerCase().includes('biodiversity')) {
    // Extract the category field (usually appears after some fields)
    const match = line.match(/Board Book Based MCQs KPK[^'"]*/i);
    if (match) chapterStrings.add(match[0].substring(0, 100));
  }
});
console.log('\n=== Distinct KPK Board Book chapter strings ===');
chapterStrings.forEach(s => console.log(`  "${s}"`));

// Check which lesson the KPK lesson normalizes to
const kpkLesson = lessons.find(l => l.title.includes('KPK'));
if (kpkLesson) {
  const normalized = normalizeText(kpkLesson.title);
  console.log(`\nKPK lesson normalized: "${normalized}"`);
  
  // Check other lessons that might ALSO match
  console.log('\n=== Testing normalized match for "board book based mcqs kpk" ===');
  const testString = 'board book based mcqs kpk  biodiversity acellular life  variety of life ';
  lessons.forEach(l => {
    const norm = normalizeText(l.title);
    if (testString.includes(norm)) {
      console.log(`  MATCH: "${l.title}" => "${norm}"`);
    }
  });
}
