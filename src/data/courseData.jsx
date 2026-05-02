import React from 'react';
import { FileText, Pencil, Library, GraduationCap, Video } from 'lucide-react';

export const LECTURE_GROUPS = [
  {
    group: 'Concept Lectures',
    color: '#3b82f6', // blue
    items: [
      { label: 'Syllabus Introduction', icon: 'video' },
      { label: 'Core Concepts Part 1', icon: 'video' },
      { label: 'Core Concepts Part 2', icon: 'video' },
    ]
  },
  {
    group: 'Practice & Discussion',
    color: '#10b981', // green
    items: [
      { label: 'Problem Solving', icon: 'video' },
      { label: 'Q&A Session', icon: 'video' },
    ]
  },
  {
    group: 'Advanced Content',
    color: '#8b5cf6', // purple
    items: [
      { label: 'Previous Year Analysis', icon: 'video' },
    ]
  },
];

export const LECTURE_TOPICS = {
  biology: [
    { name: "Acellular Life", emoji: "🌿" },
    { name: "Bioenergetics", emoji: "⚡" },
    { name: "Biological Molecules", emoji: "🧬" },
    { name: "Cell Structure & Function", emoji: "🔬" },
    { name: "Coordination & Control", emoji: "🧠" },
    { name: "Enzymes", emoji: "🧪" },
    { name: "Evolution", emoji: "🌱" },
    { name: "Reproduction", emoji: "🔥" },
    { name: "Support & Movement", emoji: "💪" },
    { name: "Inheritance", emoji: "🧬" },
    { name: "Circulation", emoji: "🩸" },
    { name: "Immunity", emoji: "🛡️" },
    { name: "Respiration", emoji: "🌬️" },
    { name: "Digestion", emoji: "🍎" },
    { name: "Homeostasis", emoji: "🌍" },
    { name: "Biotechnology", emoji: "🔬" },
  ],
  chemistry: [
    { name: "Introduction to Fundamental Concepts of Chemistry", emoji: "🧪" },
    { name: "Atomic Structure", emoji: "⚛️" },
    { name: "Gases", emoji: "💨" },
    { name: "Liquids", emoji: "💧" },
    { name: "Solids", emoji: "🧱" },
    { name: "Chemical Equilibrium", emoji: "⚖️" },
    { name: "Reaction Kinetics", emoji: "⏳" },
    { name: "Thermo Chemistry and Energetics of Chemical Reaction", emoji: "🌡️" },
    { name: "Electrochemistry", emoji: "⚡" },
    { name: "Chemical Bonding", emoji: "🧪" },
    { name: "S- and P- Block Elements", emoji: "🧬" },
    { name: "Transition Elements", emoji: "🌾" },
    { name: "Fundamental Principles of Organic Chemistry", emoji: "🌿" },
    { name: "Chemistry of Hydrocarbons", emoji: "🛢️" },
    { name: "Alkyl Halides", emoji: "🍃" },
    { name: "Alcohols and Phenols", emoji: "🍻" },
    { name: "Aldehydes and Ketones", emoji: "🍊" },
    { name: "Carboxylic Acids", emoji: "🍋" },
    { name: "Macro Molecules", emoji: "🧬" },
    { name: "Industrial Chemistry", emoji: "🏭" },
  ],
  physics: [
    { name: "Force and Motion", emoji: "🚀" },
    { name: "Work and Energy", emoji: "🔋" },
    { name: "Rotational and Circular Motion", emoji: "🌀" },
    { name: "Waves", emoji: "🌊" },
    { name: "Thermodynamics", emoji: "🌡️" },
    { name: "Electrostatics", emoji: "⚡" },
    { name: "Current Electricity", emoji: "💡" },
    { name: "Electromagnetism", emoji: "🧲" },
    { name: "Electromagnetic Induction", emoji: "🔌" },
    { name: "Electronics", emoji: "📡" },
    { name: "Dawn of Modern Physics", emoji: "🌅" },
    { name: "Atomic Spectra", emoji: "🌌" },
    { name: "Nuclear Physics", emoji: "☢️" },
    { name: "Vectors", emoji: "➡️" },
    { name: "Fluid Dynamics", emoji: "💧" },
    { name: "Alternating Current", emoji: "⚡" },
  ],
  english: [
    { name: "Key Vocabulary", emoji: "📚" },
    { name: "Tenses and Sentence Structure", emoji: "🕰️" },
    { name: "Grammar and Punctuation", emoji: "✏️" },
    { name: "Fill in the Blank", emoji: "🔲" },
    { name: "Identify Errors in Sentences", emoji: "❌" },
    { name: "Passage Comprehension", emoji: "📖" },
  ],
  'logical-reasoning': [
    { name: "Critical Thinking", emoji: "🔍" },
    { name: "Letters & Symbol Series", emoji: "✉️" },
    { name: "Logical Deductions", emoji: "🔍" },
    { name: "Logical Problems", emoji: "🧩" },
    { name: "Course of Action", emoji: "🚀" },
    { name: "Cause & Effect", emoji: "🎯" },
  ],
};

export const SUBTEST_GROUPS = [
  {
    group: 'Notes',
    color: '#3b82f6', // blue
    items: [
      { label: 'Chapter Notes', icon: 'notes' },
      { label: 'Shortlisting (High-Yield)', icon: 'notes' },
    ]
  },
  {
    group: 'Tests',
    color: '#10b981', // green
    items: [
      { label: 'Test A (Diagnostic)', icon: 'test' },
      { label: 'Test 1', icon: 'test' },
      { label: 'Test 2', icon: 'test' },
      { label: 'Test 3', icon: 'test' },
      { label: 'Test 4', icon: 'test' },
    ]
  },
  {
    group: 'Board Book Based MCQs',
    color: '#f59e0b', // amber
    items: [
      { label: 'KPK Board', icon: 'board' },
      { label: 'Punjab Board', icon: 'board' },
      { label: 'Federal Board', icon: 'board' },
      { label: 'Sindh Board', icon: 'board' },
      { label: 'Balochistan Board', icon: 'board' },
    ]
  },
  {
    group: 'Past Papers',
    color: '#8b5cf6', // purple
    items: [
      { label: 'ETEA Past Papers', icon: 'past' },
      { label: 'UHS Past Papers', icon: 'past' },
      { label: 'OCR Sheet Based Test', icon: 'past' },
    ]
  },
];

export const SubtestIcon = ({ type, color }) => {
  const style = { color, flexShrink: 0 };
  switch(type) {
    case 'notes': return <FileText size={15} style={style} />;
    case 'test':  return <Pencil size={15} style={style} />;
    case 'board': return <Library size={15} style={style} />;
    case 'past':  return <GraduationCap size={15} style={style} />;
    case 'video': return <Video size={15} style={style} />;
    default:      return <FileText size={15} style={style} />;
  }
};

export const SUBJECT_TOPICS = {
  biology: [
    { name: "Biodiversity (acellular life / variety of life)", emoji: "🌿" },
    { name: "Bio-energetics", emoji: "⚡" },
    { name: "Biological Molecules", emoji: "🧬" },
    { name: "Cell Structure and Function", emoji: "🔬" },
    { name: "Nervous Coordination and Control", emoji: "🧠" },
    { name: "Chemical Coordination", emoji: "🧬" },
    { name: "Diversity among Animals", emoji: "🦎" },
    { name: "Enzymes", emoji: "🧬" },
    { name: "Evolution", emoji: "🌱" },
    { name: "Human Circulatory System", emoji: "🩸" },
    { name: "Human Digestive System", emoji: "🍎" },
    { name: "Immunity", emoji: "🛡️" },
    { name: "Respiration", emoji: "🌬️" },
    { name: "Prokaryotes", emoji: "🔬" },
    { name: "Reproduction", emoji: "🔥" },
    { name: "Support & Movement", emoji: "💪" },
    { name: "Variation & Genetics / Inheritance", emoji: "🧬" },
    { name: "Homeostasis", emoji: "🌍" },
    { name: "Biotechnology", emoji: "🔬" },
  ],
  chemistry: [
    { name: "Introduction to Fundamental Concepts of Chemistry", emoji: "🧪" },
    { name: "Atomic Structure", emoji: "⚛️" },
    { name: "Gases", emoji: "💨" },
    { name: "Liquids", emoji: "💧" },
    { name: "Solids", emoji: "🧱" },
    { name: "Chemical Equilibrium", emoji: "⚖️" },
    { name: "Reaction Kinetics", emoji: "⏳" },
    { name: "Thermo-chemistry and Energetics of Chemical Reactions", emoji: "🌡️" },
    { name: "Electrochemistry", emoji: "⚡" },
    { name: "Chemical Bonding", emoji: "🧪" },
    { name: "S and P Block Elements", emoji: "🧬" },
    { name: "Transition Elements", emoji: "🌾" },
    { name: "Fundamental Principles of Organic Chemistry", emoji: "🌿" },
    { name: "Chemistry of Hydrocarbons", emoji: "🛢️" },
    { name: "Alkyl Halides", emoji: "🍃" },
    { name: "Alcohols & Phenols", emoji: "🍻" },
    { name: "Aldehydes and Ketones", emoji: "🍊" },
    { name: "Carboxylic Acids", emoji: "🍋" },
    { name: "Macromolecules", emoji: "🧬" },
    { name: "Industrial Chemistry", emoji: "🏭" },
  ],
  physics: [
    { name: "Force and Motion", emoji: "🚀" },
    { name: "Work and Energy", emoji: "🔋" },
    { name: "Rotational and Circular Motion", emoji: "🌀" },
    { name: "Waves", emoji: "🌊" },
    { name: "Thermodynamics", emoji: "🌡️" },
    { name: "Electrostatics", emoji: "⚡" },
    { name: "Current Electricity", emoji: "💡" },
    { name: "Electromagnetism", emoji: "🧲" },
    { name: "Electromagnetic Induction", emoji: "🔌" },
    { name: "Electronics", emoji: "📡" },
    { name: "Dawn of Modern Physics", emoji: "🌅" },
    { name: "Atomic Spectra", emoji: "🌌" },
    { name: "Nuclear Physics", emoji: "☢️" },
    { name: "Vectors", emoji: "➡️" },
    { name: "Fluid Dynamics", emoji: "💧" },
    { name: "Alternating Current", emoji: "⚡" },
  ],
  english: [
    { name: "Key Vocabulary", emoji: "📚" },
    { name: "Tenses and Sentence Structure", emoji: "🕰️" },
    { name: "Grammar and Punctuation", emoji: "✏️" },
    { name: "Fill in the Blank", emoji: "🔲" },
    { name: "Identify Errors in Sentences", emoji: "❌" },
    { name: "Passage Comprehension", emoji: "📖" },
  ],
  'logical-reasoning': [
    { name: "Critical Thinking", emoji: "🔍" },
    { name: "Letters & Symbol Series", emoji: "✉️" },
    { name: "Logical Deductions", emoji: "🔍" },
    { name: "Logical Problems", emoji: "🧩" },
    { name: "Course of Action", emoji: "🚀" },
    { name: "Cause & Effect", emoji: "🎯" },
  ],
};

