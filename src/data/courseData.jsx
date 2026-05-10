import React from 'react';
import { FileText, Pencil, Library, GraduationCap, Video } from 'lucide-react';

// ── Subjects (sourced from real WordPress TutorLMS data via course_map.json) ──

export const SUBJECTS = [
  { slug: 'biology-mcqs',               name: 'Biology',          emoji: '🧬', type: 'mcq',        order: 0 },
  { slug: 'chemistry-mcqs',             name: 'Chemistry',         emoji: '⚗️', type: 'mcq',        order: 1 },
  { slug: 'physics-mcqs',               name: 'Physics',           emoji: '⚡', type: 'mcq',        order: 2 },
  { slug: 'english-mcqs',               name: 'English',           emoji: '📚', type: 'mcq',        order: 3 },
  { slug: 'logical-reasoning-mcqs',     name: 'Logical Reasoning', emoji: '🧠', type: 'mcq',        order: 4 },
  { slug: 'biology-lectures',           name: 'Biology',           emoji: '🧬', type: 'lecture',    order: 5 },
  { slug: 'chemistry-lectures',         name: 'Chemistry',         emoji: '⚗️', type: 'lecture',    order: 6 },
  { slug: 'physics-lectures',           name: 'Physics',           emoji: '⚡', type: 'lecture',    order: 7 },
  { slug: 'english-lectures',           name: 'English',           emoji: '📚', type: 'lecture',    order: 8 },
  { slug: 'logical-reasoning-lectures', name: 'Logical Reasoning', emoji: '🧠', type: 'lecture',    order: 9 },
  { slug: 'past-papers-full-length',    name: 'Past Papers',       emoji: '📋', type: 'pastpaper',  order: 10 },
  { slug: 'full-length-test-series',    name: 'Test Series',       emoji: '📝', type: 'testseries', order: 11 },
  { slug: 'predoctr-test-series',       name: 'preDoctr Tests',    emoji: '📝', type: 'testseries', order: 12 },
];

// ── Biology MCQs — 20 Chapters ────────────────────────────────────────────────
export const BIOLOGY_CHAPTERS = [
  { name: 'Biodiversity (acellular life / variety of life)', emoji: '🌿' },
  { name: 'Bio-energetics',                                  emoji: '⚡' },
  { name: 'Biological Molecules',                            emoji: '🧬' },
  { name: 'Cell Structure and Function',                     emoji: '🔬' },
  { name: 'Nervous & Chemical Coordination',                 emoji: '🧠' },
  { name: 'Diversity among Animals',                         emoji: '🐅' },
  { name: 'Enzymes',                                         emoji: '🧬' },
  { name: 'Evolution',                                       emoji: '🌱' },
  { name: 'Prokaryotes',                                     emoji: '🔬' },
  { name: 'Reproduction',                                    emoji: '🐣' },
  { name: 'Support & Movement',                              emoji: '💪' },
  { name: 'Life Processes in Plants and Animals (Nutrition / Gaseous Exchange / Transport)', emoji: '🌿' },
  { name: 'Genetics / Variation & Inheritance',              emoji: '🧬' },
  { name: 'Fungi',                                           emoji: '🍄' },
  { name: 'Diversity among Plants (Plantae)',                emoji: '🌿' },
  { name: 'Homeostasis',                                     emoji: '🌍' },
  { name: 'Cell Division',                                   emoji: '🔬' },
  { name: 'Acellular Life (Viruses)',                        emoji: '🦠' },
  { name: 'Kingdom Animalia',                                emoji: '🐾' },
  { name: 'Human Circulatory System & Blood',                emoji: '🩸' },
];

// ── Chemistry MCQs — 20 Chapters ─────────────────────────────────────────────
export const CHEMISTRY_CHAPTERS = [
  { name: 'Stoichiometry',                                  emoji: '🧪' },
  { name: 'Atomic Structure',                               emoji: '⚛️' },
  { name: 'Gases',                                          emoji: '💨' },
  { name: 'Liquids',                                        emoji: '💧' },
  { name: 'Solids',                                         emoji: '🧱' },
  { name: 'Chemical Equilibrium',                           emoji: '⚖️' },
  { name: 'Reaction Kinetics',                              emoji: '⏳' },
  { name: 'Thermochemistry & Energetics',                   emoji: '🌡️' },
  { name: 'Electrochemistry',                               emoji: '⚡' },
  { name: 'Solutions',                                      emoji: '🧫' },
  { name: 'Acids, Bases and Salts',                         emoji: '🧪' },
  { name: 'Periodic Table & Periodicity',                   emoji: '📊' },
  { name: 'Chemical Bonding',                               emoji: '🔗' },
  { name: 'S-Block & P-Block Elements',                     emoji: '🧬' },
  { name: 'Transition Elements',                            emoji: '🌾' },
  { name: 'Fundamental Principles of Organic Chemistry',    emoji: '🌿' },
  { name: 'Chemistry of Hydrocarbons',                      emoji: '🛢️' },
  { name: 'Alkyl & Aryl Halides',                           emoji: '🍃' },
  { name: 'Alcohols, Phenols, Aldehydes & Ketones',         emoji: '🍻' },
  { name: 'Carboxylic Acids, Macromolecules & Industrial Chemistry', emoji: '🏭' },
];

// ── Physics MCQs — 16 Chapters ────────────────────────────────────────────────
export const PHYSICS_CHAPTERS = [
  { name: 'Measurements',                emoji: '📏' },
  { name: 'Scalars and Vectors',          emoji: '➡️' },
  { name: 'Motion and Force',             emoji: '🚀' },
  { name: 'Work, Energy and Power',       emoji: '🔋' },
  { name: 'Circular Motion',              emoji: '🌀' },
  { name: 'Fluid Dynamics',              emoji: '💧' },
  { name: 'Oscillations',                emoji: '〰️' },
  { name: 'Waves',                        emoji: '🌊' },
  { name: 'Thermodynamics',              emoji: '🌡️' },
  { name: 'Electrostatics',              emoji: '⚡' },
  { name: 'Current Electricity',         emoji: '💡' },
  { name: 'Electromagnetism',            emoji: '🧲' },
  { name: 'Electromagnetic Induction',   emoji: '🔌' },
  { name: 'Alternating Current',         emoji: '⚡' },
  { name: 'Electronics',                 emoji: '📡' },
  { name: 'Dawn of Modern Physics / Atomic Spectra / Nuclear Physics', emoji: '☢️' },
];

// ── English MCQs — 6 Chapters ─────────────────────────────────────────────────
export const ENGLISH_CHAPTERS = [
  { name: 'Key Vocabulary',                   emoji: '📚' },
  { name: 'Tenses and Sentence Structure',    emoji: '🕰️' },
  { name: 'Grammar and Punctuation',          emoji: '✏️' },
  { name: 'Fill in the Blank',                emoji: '🔲' },
  { name: 'Identify Errors in Sentences',     emoji: '❌' },
  { name: 'Passage Comprehension',            emoji: '📖' },
];

// ── Logical Reasoning MCQs — 7 Chapters ──────────────────────────────────────
export const LOGICAL_REASONING_CHAPTERS = [
  { name: 'Critical Thinking',              emoji: '🔍' },
  { name: 'Letters & Symbol Series',        emoji: '✉️' },
  { name: 'Logical Deductions',             emoji: '🔍' },
  { name: 'Logical Problems',               emoji: '🧩' },
  { name: 'Course of Action',               emoji: '🚀' },
  { name: 'Cause & Effect',                 emoji: '🎯' },
  { name: 'General',                        emoji: '📋' },
];

// ── Legacy exports (used by existing components) ──────────────────────────────

export const SUBJECT_TOPICS = {
  biology:            BIOLOGY_CHAPTERS,
  chemistry:          CHEMISTRY_CHAPTERS,
  physics:            PHYSICS_CHAPTERS,
  english:            ENGLISH_CHAPTERS,
  'logical-reasoning': LOGICAL_REASONING_CHAPTERS,
};

export const LECTURE_TOPICS = {
  biology: [
    { name: 'Biodiversity',                                emoji: '🌿' },
    { name: 'Bio-energetics',                              emoji: '⚡' },
    { name: 'Biological Molecules',                        emoji: '🧬' },
    { name: 'Cell Structure and Function',                 emoji: '🔬' },
    { name: 'Nervous & Chemical Coordination',             emoji: '🧠' },
    { name: 'Diversity among Animals',                     emoji: '🐅' },
    { name: 'Enzymes',                                     emoji: '🧬' },
    { name: 'Evolution',                                   emoji: '🌱' },
    { name: 'Prokaryotes',                                 emoji: '🔬' },
    { name: 'Reproduction',                                emoji: '🐣' },
    { name: 'Support & Movement',                          emoji: '💪' },
    { name: 'Life Processes in Plants & Animals',          emoji: '🌿' },
    { name: 'Genetics',                                    emoji: '🧬' },
    { name: 'Fungi',                                       emoji: '🍄' },
    { name: 'Plantae',                                     emoji: '🌿' },
    { name: 'Homeostasis',                                 emoji: '🌍' },
  ],
  chemistry: [
    { name: 'Stoichiometry',                               emoji: '🧪' },
    { name: 'Atomic Structure',                            emoji: '⚛️' },
    { name: 'Gases',                                       emoji: '💨' },
    { name: 'Liquids',                                     emoji: '💧' },
    { name: 'Solids',                                      emoji: '🧱' },
    { name: 'Chemical Equilibrium',                        emoji: '⚖️' },
    { name: 'Reaction Kinetics',                           emoji: '⏳' },
    { name: 'Thermochemistry',                             emoji: '🌡️' },
    { name: 'Electrochemistry',                            emoji: '⚡' },
    { name: 'Chemical Bonding',                            emoji: '🔗' },
    { name: 'S-Block & P-Block Elements',                  emoji: '🧬' },
    { name: 'Transition Elements',                         emoji: '🌾' },
    { name: 'Fundamental Principles of Organic Chemistry', emoji: '🌿' },
    { name: 'Chemistry of Hydrocarbons',                   emoji: '🛢️' },
    { name: 'Alkyl Halides',                               emoji: '🍃' },
    { name: 'Dawn of Modern Physics',                      emoji: '🌅' },
    { name: 'Atomic Spectra',                              emoji: '🌌' },
    { name: 'Nuclear Physics',                             emoji: '☢️' },
    { name: 'Electronics',                                 emoji: '📡' },
    { name: 'Alternating Current',                         emoji: '⚡' },
  ],
  physics: [
    { name: 'Measurements',                                emoji: '📏' },
    { name: 'Scalars and Vectors',                         emoji: '➡️' },
    { name: 'Motion and Force',                            emoji: '🚀' },
    { name: 'Work, Energy and Power',                      emoji: '🔋' },
    { name: 'Circular Motion',                             emoji: '🌀' },
    { name: 'Fluid Dynamics',                              emoji: '💧' },
    { name: 'Waves',                                       emoji: '🌊' },
    { name: 'Thermodynamics',                              emoji: '🌡️' },
    { name: 'Electrostatics',                              emoji: '⚡' },
    { name: 'Current Electricity',                         emoji: '💡' },
    { name: 'Electromagnetism',                            emoji: '🧲' },
    { name: 'Electromagnetic Induction',                   emoji: '🔌' },
    { name: 'Alternating Current',                         emoji: '⚡' },
    { name: 'Electronics',                                 emoji: '📡' },
    { name: 'Dawn of Modern Physics',                      emoji: '🌅' },
    { name: 'Atomic Spectra',                              emoji: '🌌' },
  ],
  english: [
    { name: 'Key Vocabulary',                              emoji: '📚' },
    { name: 'Tenses',                                      emoji: '🕰️' },
    { name: 'Passage Comprehension',                       emoji: '📖' },
    { name: 'Sentence Structure & Types',                  emoji: '✏️' },
    { name: 'Parts of Speech',                             emoji: '🔤' },
    { name: 'Infinitives and Gerunds',                     emoji: '📝' },
    { name: 'Punctuation',                                 emoji: '⁉️' },
    { name: 'Active and Passive Voice',                    emoji: '🔄' },
    { name: 'Direct and Indirect Speech',                  emoji: '💬' },
  ],
  'logical-reasoning': [
    { name: 'Critical Thinking',                           emoji: '🔍' },
    { name: 'Letter and Symbol Series',                    emoji: '✉️' },
    { name: 'Logical Deductions',                          emoji: '🔍' },
    { name: 'Logical Problems',                            emoji: '🧩' },
    { name: 'Course of Action',                            emoji: '🚀' },
    { name: 'Cause and Effect',                            emoji: '🎯' },
  ],
};

// ── Lesson type groups (for chapter detail view) ──────────────────────────────

export const LESSON_TYPE_GROUPS = [
  { type: 'notes',       label: 'Notes',                  color: '#3b82f6', icon: 'notes' },
  { type: 'shortlisting',label: 'Shortlisting (High-Yield)', color: '#06b6d4', icon: 'notes' },
  { type: 'test',        label: 'Chapter Tests',          color: '#10b981', icon: 'test'  },
  { type: 'board_book',  label: 'Board Book MCQs',        color: '#f59e0b', icon: 'board' },
  { type: 'past_paper',  label: 'Past Papers',            color: '#8b5cf6', icon: 'past'  },
  { type: 'ocr',         label: 'OCR Sheet Tests',        color: '#ef4444', icon: 'past'  },
  { type: 'video',       label: 'Video Lectures',         color: '#6366f1', icon: 'video' },
];

export const SUBTEST_GROUPS = [
  {
    group: 'Notes',
    color: '#3b82f6',
    items: [
      { label: 'Chapter Notes', icon: 'notes' },
      { label: 'Shortlisting (High-Yield)', icon: 'notes' },
    ]
  },
  {
    group: 'Tests',
    color: '#10b981',
    items: [
      { label: 'Test A (Diagnostic)', icon: 'test' },
      { label: 'Test B', icon: 'test' },
      { label: 'Test 1', icon: 'test' },
      { label: 'Test 2', icon: 'test' },
      { label: 'Test 3', icon: 'test' },
      { label: 'Test 4', icon: 'test' },
    ]
  },
  {
    group: 'Board Book Based MCQs',
    color: '#f59e0b',
    items: [
      { label: 'KPK Board',         icon: 'board' },
      { label: 'Punjab Board',      icon: 'board' },
      { label: 'Federal Board',     icon: 'board' },
      { label: 'Sindh Board',       icon: 'board' },
      { label: 'Balochistan Board', icon: 'board' },
    ]
  },
  {
    group: 'Past Papers',
    color: '#8b5cf6',
    items: [
      { label: 'ETEA Past Papers',    icon: 'past' },
      { label: 'UHS Past Papers',     icon: 'past' },
      { label: 'OCR Sheet Based Test',icon: 'past' },
    ]
  },
];

export const LECTURE_GROUPS = [
  {
    group: 'Concept Lectures',
    color: '#3b82f6',
    items: [
      { label: 'Syllabus Introduction', icon: 'video' },
      { label: 'Core Concepts Part 1',  icon: 'video' },
      { label: 'Core Concepts Part 2',  icon: 'video' },
    ]
  },
  {
    group: 'Practice & Discussion',
    color: '#10b981',
    items: [
      { label: 'Problem Solving', icon: 'video' },
      { label: 'Q&A Session',     icon: 'video' },
    ]
  },
];

export const SubtestIcon = ({ type, color }) => {
  const style = { color, flexShrink: 0 };
  switch (type) {
    case 'notes': return <FileText   size={15} style={style} />;
    case 'test':  return <Pencil     size={15} style={style} />;
    case 'board': return <Library    size={15} style={style} />;
    case 'past':  return <GraduationCap size={15} style={style} />;
    case 'video': return <Video      size={15} style={style} />;
    default:      return <FileText   size={15} style={style} />;
  }
};
