const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const mcqs = [
  {
    "question_text": "Which step of glycolysis directly produces ATP by substrate-level phosphorylation?",
    "options": [
      "Conversion of glucose to glucose-6-phosphate",
      "Conversion of fructose-6-phosphate to fructose-1,6-bisphosphate",
      "Conversion of phosphoenolpyruvate to pyruvate",
      "Conversion of pyruvate to acetyl-CoA"
    ],
    "correct_answer": "C",
    "explanation": "The conversion of phosphoenolpyruvate (PEP) to pyruvate by pyruvate kinase directly generates ATP through substrate-level phosphorylation."
  },
  {
    "question_text": "Under anaerobic conditions in human muscle cells, pyruvate is primarily converted into:",
    "options": [
      "Acetyl-CoA",
      "Lactate",
      "Ethanol",
      "Carbon dioxide"
    ],
    "correct_answer": "B",
    "explanation": "In human muscles lacking oxygen, pyruvate is reduced to lactate to regenerate NAD+ so glycolysis can continue."
  },
  {
    "question_text": "How many NADH molecules are generated during glycolysis from one molecule of glucose?",
    "options": [
      "1",
      "2",
      "4",
      "6"
    ],
    "correct_answer": "B",
    "explanation": "Each glucose molecule produces 2 NADH molecules during the oxidation of glyceraldehyde-3-phosphate."
  },
  {
    "question_text": "Which metabolic pathway is most active during prolonged starvation?",
    "options": [
      "Glycogenesis",
      "Lipogenesis",
      "Gluconeogenesis",
      "Glycolysis"
    ],
    "correct_answer": "C",
    "explanation": "During starvation, gluconeogenesis becomes highly active to maintain blood glucose levels."
  },
  {
    "question_text": "Which molecule acts as the final electron acceptor in aerobic respiration?",
    "options": [
      "NAD+",
      "Pyruvate",
      "Oxygen",
      "Carbon dioxide"
    ],
    "correct_answer": "C",
    "explanation": "Oxygen accepts electrons at the end of the electron transport chain and combines with hydrogen ions to form water."
  },
  {
    "question_text": "The majority of ATP in aerobic respiration is produced during:",
    "options": [
      "Glycolysis",
      "Krebs cycle",
      "Electron transport chain",
      "Fermentation"
    ],
    "correct_answer": "C",
    "explanation": "Most ATP is generated through oxidative phosphorylation in the electron transport chain."
  },
  {
    "question_text": "Which of the following compounds enters the Krebs cycle directly?",
    "options": [
      "Glucose",
      "Pyruvate",
      "Acetyl-CoA",
      "Lactate"
    ],
    "correct_answer": "C",
    "explanation": "Acetyl-CoA combines with oxaloacetate to initiate the Krebs cycle."
  },
  {
    "question_text": "How many ATP molecules are directly consumed during glycolysis?",
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct_answer": "B",
    "explanation": "Two ATP molecules are invested during the preparatory phase of glycolysis."
  },
  {
    "question_text": "The enzyme ATP synthase is located primarily in the:",
    "options": [
      "Outer mitochondrial membrane",
      "Cytoplasm",
      "Inner mitochondrial membrane",
      "Nucleus"
    ],
    "correct_answer": "C",
    "explanation": "ATP synthase is embedded in the inner mitochondrial membrane where chemiosmosis occurs."
  },
  {
    "question_text": "Which process generates ATP in the absence of oxygen?",
    "options": [
      "Oxidative phosphorylation",
      "Fermentation",
      "Electron transport chain",
      "Chemiosmosis"
    ],
    "correct_answer": "B",
    "explanation": "Fermentation allows ATP production indirectly by enabling glycolysis to continue without oxygen."
  },
  {
    "question_text": "How many ATP molecules are formed directly in the Krebs cycle per glucose molecule?",
    "options": [
      "1",
      "2",
      "4",
      "6"
    ],
    "correct_answer": "B",
    "explanation": "Each turn of the Krebs cycle produces 1 ATP equivalent, and one glucose causes two turns."
  },
  {
    "question_text": "Which coenzyme carries high-energy electrons to the electron transport chain?",
    "options": [
      "ADP",
      "CoA",
      "NADH",
      "ATP"
    ],
    "correct_answer": "C",
    "explanation": "NADH transports high-energy electrons from earlier stages of respiration to the electron transport chain."
  },
  {
    "question_text": "Which metabolic process results in the formation of ketone bodies?",
    "options": [
      "Glycolysis",
      "Ketogenesis",
      "Glycogenesis",
      "Fermentation"
    ],
    "correct_answer": "B",
    "explanation": "Ketogenesis occurs mainly during prolonged fasting or carbohydrate deficiency."
  },
  {
    "question_text": "The conversion of pyruvate into acetyl-CoA occurs in the:",
    "options": [
      "Cytoplasm",
      "Nucleus",
      "Mitochondrial matrix",
      "Golgi apparatus"
    ],
    "correct_answer": "C",
    "explanation": "Pyruvate oxidation takes place inside the mitochondrial matrix in eukaryotic cells."
  },
  {
    "question_text": "Which stage of cellular respiration releases the greatest amount of CO2?",
    "options": [
      "Glycolysis",
      "Krebs cycle",
      "Electron transport chain",
      "Chemiosmosis"
    ],
    "correct_answer": "B",
    "explanation": "The Krebs cycle releases four CO2 molecules per glucose molecule."
  },
  {
    "question_text": "What is the net ATP gain from glycolysis alone?",
    "options": [
      "1 ATP",
      "2 ATP",
      "4 ATP",
      "8 ATP"
    ],
    "correct_answer": "B",
    "explanation": "Although 4 ATP are produced, 2 ATP are consumed, resulting in a net gain of 2 ATP."
  },
  {
    "question_text": "Which process involves the movement of protons across the inner mitochondrial membrane?",
    "options": [
      "Substrate-level phosphorylation",
      "Chemiosmosis",
      "Fermentation",
      "Hydrolysis"
    ],
    "correct_answer": "B",
    "explanation": "Chemiosmosis involves proton flow through ATP synthase to generate ATP."
  },
  {
    "question_text": "Which of the following is reduced during cellular respiration?",
    "options": [
      "Oxygen",
      "Glucose",
      "Carbon dioxide",
      "ATP"
    ],
    "correct_answer": "A",
    "explanation": "Oxygen gains electrons and hydrogen ions to form water, meaning it is reduced."
  },
  {
    "question_text": "During fasting, amino acids are mainly utilized for:",
    "options": [
      "Protein synthesis",
      "Glycogenesis",
      "Gluconeogenesis",
      "Lipid storage"
    ],
    "correct_answer": "C",
    "explanation": "Amino acids are converted into glucose precursors during gluconeogenesis."
  },
  {
    "question_text": "Which pathway is common to both aerobic and anaerobic respiration?",
    "options": [
      "Krebs cycle",
      "Electron transport chain",
      "Glycolysis",
      "Oxidative phosphorylation"
    ],
    "correct_answer": "C",
    "explanation": "Glycolysis occurs in both aerobic and anaerobic conditions."
  }
];

async function insertMCQs() {
  const client = await pool.connect();
  try {
    const chapterId = 126; // Bio-energetics
    const lessonId = 1994; // Respiration Test 4

    let addedCount = 0;

    for (const mcq of mcqs) {
      const qText = mcq.question_text.trim();

      // Check for duplicates in Chapter 126
      const checkRes = await client.query(
        `SELECT id FROM mcqs WHERE chapter_id = $1 AND question_text = $2 AND is_active = TRUE`,
        [chapterId, qText]
      );

      if (checkRes.rows.length === 0) {
        // Map answer 'A' to 'a', etc.
        const correctOptLetter = mcq.correct_answer.toLowerCase();

        await client.query(`
          INSERT INTO mcqs (
            subject, chapter, chapter_id, lesson_id, 
            question_text, option_a, option_b, option_c, option_d, 
            correct_opt, explanation, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          'Biology', 'Bio-energetics', chapterId, lessonId,
          qText, mcq.options[0], mcq.options[1], mcq.options[2], mcq.options[3],
          correctOptLetter, mcq.explanation, true
        ]);
        
        addedCount++;
      } else {
        console.log(`Skipped (Duplicate in Chapter): ${qText.substring(0, 50)}...`);
      }
    }

    console.log(`Successfully added ${addedCount} MCQs to Lesson 1994.`);

  } catch (err) {
    console.error('Error inserting MCQs:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

insertMCQs();
