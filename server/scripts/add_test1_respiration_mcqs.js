const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const mcqs = [
  {
    "question": "Which enzyme catalyzes the 'committed step' of glycolysis, effectively preventing the glucose-6-phosphate from entering other metabolic pathways?",
    "options": [
      "Hexokinase",
      "Phosphofructokinase-1 (PFK-1)",
      "Aldolase",
      "Pyruvate Kinase"
    ],
    "answer": "Phosphofructokinase-1 (PFK-1)",
    "explanation": "PFK-1 is the key regulatory enzyme of glycolysis. While hexokinase traps glucose in the cell, the reaction catalyzed by PFK-1 is the first irreversible step unique to the glycolytic pathway."
  },
  {
    "question": "In the 'pay-off' phase of glycolysis, which specific reaction involves the first substrate-level phosphorylation to generate ATP?",
    "options": [
      "Conversion of PEP to Pyruvate",
      "Conversion of 1,3-bisphosphoglycerate to 3-phosphoglycerate",
      "Conversion of G3P to 1,3-bisphosphoglycerate",
      "Conversion of 2-phosphoglycerate to PEP"
    ],
    "answer": "Conversion of 1,3-bisphosphoglycerate to 3-phosphoglycerate",
    "explanation": "Phosphoglycerate kinase transfers a high-energy phosphate group from 1,3-BPG to ADP, forming the first ATP of the pay-off phase."
  },
  {
    "question": "What is the net yield of NADH and ATP respectively when one molecule of Fructose-1,6-bisphosphate is converted to two molecules of Pyruvate?",
    "options": [
      "2 NADH and 2 ATP",
      "2 NADH and 4 ATP",
      "1 NADH and 2 ATP",
      "4 NADH and 4 ATP"
    ],
    "answer": "2 NADH and 4 ATP",
    "explanation": "Because Fructose-1,6-bisphosphate is already phosphorylated twice, the 'investment phase' is bypassed. Therefore, you get the full 4 ATP and 2 NADH from the pay-off phase without the 2 ATP deduction."
  },
  {
    "question": "During strenuous exercise, skeletal muscle cells perform lactic acid fermentation. What is the primary biological purpose of reducing pyruvate to lactate?",
    "options": [
      "To produce additional ATP",
      "To decrease the pH of the muscle to trigger oxygen release",
      "To regenerate NAD+ from NADH",
      "To store energy for later use in the Krebs cycle"
    ],
    "answer": "To regenerate NAD+ from NADH",
    "explanation": "Glycolysis requires NAD+ to continue. In anaerobic conditions, the cell must oxidize NADH back to NAD+ by reducing pyruvate to lactate."
  },
  {
    "question": "The oxidation of one molecule of Glucose via the Link Reaction and Krebs Cycle (excluding glycolysis) produces how many molecules of $CO_2$?",
    "options": [
      "2",
      "4",
      "6",
      "0"
    ],
    "answer": "6",
    "explanation": "Two $CO_2$ are produced in the Link Reaction (one per pyruvate) and four $CO_2$ are produced in the Krebs cycle (two per turn). Total = 6."
  },
  {
    "question": "Which of the following describes an 'amphibolic' pathway?",
    "options": [
      "A pathway that only breaks down molecules",
      "A pathway that only builds up molecules",
      "A pathway that serves both catabolic and anabolic functions",
      "A pathway that can occur with or without oxygen"
    ],
    "answer": "A pathway that serves both catabolic and anabolic functions",
    "explanation": "The Krebs Cycle is considered amphibolic because it breaks down glucose (catabolism) but also provides intermediates for synthesizing amino acids and fatty acids (anabolism)."
  },
  {
    "question": "In the Electron Transport Chain, which complex is responsible for the direct reduction of molecular Oxygen to Water?",
    "options": [
      "Complex I (NADH dehydrogenase)",
      "Complex II (Succinate dehydrogenase)",
      "Complex III (Cytochrome bc1 complex)",
      "Complex IV (Cytochrome c oxidase)"
    ],
    "answer": "Complex IV (Cytochrome c oxidase)",
    "explanation": "Complex IV transfers electrons to oxygen, the final electron acceptor, which then combines with protons to form water."
  },
  {
    "question": "What happens to the 'compensation point' if the concentration of $CO_2$ in the atmosphere is significantly increased?",
    "options": [
      "The light intensity required to reach the point decreases",
      "The light intensity required to reach the point increases",
      "The compensation point remains unchanged",
      "Respiration stops entirely"
    ],
    "answer": "The light intensity required to reach the point decreases",
    "explanation": "With more $CO_2$ available, photosynthesis can reach the rate of respiration at a lower light intensity."
  },
  {
    "question": "Which 4-carbon compound is regenerated at the end of the Krebs cycle to allow the cycle to continue?",
    "options": [
      "Citrate",
      "Malate",
      "Oxaloacetate",
      "Succinate"
    ],
    "answer": "Oxaloacetate",
    "explanation": "Oxaloacetate (4C) combines with Acetyl-CoA (2C) to form Citrate (6C), starting the cycle anew."
  },
  {
    "question": "Arsenate is a toxic analog of inorganic phosphate. If it replaces phosphate in the glycolysis reaction catalyzed by G3P dehydrogenase, what is the most likely result?",
    "options": [
      "Glycolysis stops immediately",
      "NADH is not produced",
      "ATP is produced but NADH is not",
      "NADH is produced but no net ATP is gained from the pathway"
    ],
    "answer": "NADH is produced but no net ATP is gained from the pathway",
    "explanation": "Arsenate allows the reaction to proceed but the resulting intermediate bypasses the first ATP-generating step. Therefore, the 2 ATP invested are never 'repaid' by that specific step."
  },
  {
    "question": "Which molecule acts as a mobile electron carrier between Complex III and Complex IV in the inner mitochondrial membrane?",
    "options": [
      "Ubiquinone (Coenzyme Q)",
      "Cytochrome c",
      "FADH2",
      "NADPH"
    ],
    "answer": "Cytochrome c",
    "explanation": "Ubiquinone carries electrons between complexes I/II and III, while Cytochrome c is a small peripheral protein that carries electrons from III to IV."
  },
  {
    "question": "If a plant is kept in total darkness, its 'Respiratory Quotient' (RQ) for glucose would theoretically be:",
    "options": [
      "0.7",
      "1.0",
      "Infinity",
      "0.0"
    ],
    "answer": "1.0",
    "explanation": "The RQ for carbohydrates is always 1.0 (6 $CO_2$ produced / 6 $O_2$ consumed). Darkness prevents photosynthesis but does not change the stoichiometry of aerobic respiration."
  },
  {
    "question": "Identify the 5-carbon intermediate produced during the Krebs cycle.",
    "options": [
      "Isocitrate",
      "Alpha-ketoglutarate",
      "Succinyl-CoA",
      "Fumarate"
    ],
    "answer": "Alpha-ketoglutarate",
    "explanation": "Alpha-ketoglutarate is the only 5-carbon intermediate in the Krebs cycle, formed after the first decarboxylation of isocitrate."
  },
  {
    "question": "What is the specific role of the $F_0$ subunit in the ATP Synthase enzyme?",
    "options": [
      "Catalyzing the synthesis of ATP",
      "Binding ADP and Phosphate",
      "Acting as a proton channel through the membrane",
      "Rotating the catalytic head"
    ],
    "answer": "Acting as a proton channel through the membrane",
    "explanation": "The $F_0$ subunit is the transmembrane portion that allows $H^+$ ions to flow down their gradient, which powers the rotation of the $F_1$ catalytic subunit."
  },
  {
    "question": "In the absence of oxygen, yeast cells produce ethanol. Which of the following is released as a byproduct during the conversion of pyruvate to acetaldehyde?",
    "options": [
      "Oxygen",
      "Water",
      "Carbon Dioxide",
      "ATP"
    ],
    "answer": "Carbon Dioxide",
    "explanation": "Alcoholic fermentation involves the decarboxylation of pyruvate (3C) into acetaldehyde (2C), releasing $CO_2$."
  },
  {
    "question": "Which compound is the product of the 'Link Reaction' that enters the mitochondrial matrix to begin the citric acid cycle?",
    "options": [
      "Citric acid",
      "Acetyl-CoA",
      "Oxaloacetate",
      "Pyruvate"
    ],
    "answer": "Acetyl-CoA",
    "explanation": "Pyruvate is decarboxylated and oxidized to form an acetyl group, which is then attached to Coenzyme A to form Acetyl-CoA."
  },
  {
    "question": "How many turns of the Krebs cycle are required to completely oxidize the carbon atoms from one sucrose molecule?",
    "options": [
      "1",
      "2",
      "4",
      "8"
    ],
    "answer": "4",
    "explanation": "Sucrose consists of one glucose and one fructose (2 monosaccharides). Each monosaccharide yields 2 pyruvates, totaling 4 pyruvates. Since each pyruvate powers one turn, 4 turns are required."
  },
  {
    "question": "Cyanide inhibits cellular respiration by binding to the iron in Cytochrome c oxidase. This would directly prevent:",
    "options": [
      "The splitting of glucose",
      "The reduction of NAD+",
      "The final transfer of electrons to oxygen",
      "The entry of pyruvate into the mitochondria"
    ],
    "answer": "The final transfer of electrons to oxygen",
    "explanation": "Cytochrome c oxidase is Complex IV. Blocking it stops the entire ETC because electrons cannot be 'dumped' onto oxygen."
  },
  {
    "question": "In the enzyme 'Enolase' in glycolysis is responsible for which type of reaction?",
    "options": [
      "Oxidation",
      "Phosphorylation",
      "Dehydration",
      "Isomerization"
    ],
    "answer": "Dehydration",
    "explanation": "Enolase removes a water molecule from 2-phosphoglycerate to create Phosphoenolpyruvate (PEP)."
  },
  {
    "question": "Which respiratory process produces the most water as a byproduct?",
    "options": [
      "Glycolysis",
      "Krebs cycle",
      "Electron Transport Chain",
      "Lactic acid fermentation"
    ],
    "answer": "Electron Transport Chain",
    "explanation": "Metabolic water is formed at the very end of the ETC when oxygen is reduced by protons and electrons."
  },
  {
    "question": "How many ATP molecules are produced specifically by 'Substrate-Level Phosphorylation' for every one molecule of glucose that enters aerobic respiration?",
    "options": [
      "2",
      "4",
      "34",
      "38"
    ],
    "answer": "4",
    "explanation": "You get 2 net ATP from glycolysis and 2 ATP (one per turn) from the Krebs cycle via substrate-level phosphorylation. The rest come from oxidative phosphorylation."
  },
  {
    "question": "Which of the following is true regarding $FADH_2$ compared to NADH?",
    "options": [
      "It produces more ATP per molecule",
      "It enters the ETC at Complex I",
      "It bypasses Complex I and enters at Complex II",
      "It is produced in the cytoplasm"
    ],
    "answer": "It bypasses Complex I and enters at Complex II",
    "explanation": "$FADH_2$ has a lower energy level than NADH; it enters at Complex II, which means it pumps fewer protons and generates less ATP (approx 1.5 vs 2.5 for NADH)."
  },
  {
    "question": "During the isomerization of Glucose-6-phosphate to Fructose-6-phosphate, which enzyme is used?",
    "options": [
      "Phosphoglucose isomerase",
      "Phosphofructokinase",
      "Triose phosphate isomerase",
      "Mutase"
    ],
    "answer": "Phosphoglucose isomerase",
    "explanation": "This enzyme converts the aldose (glucose) into a ketose (fructose) to prepare the molecule for a second phosphorylation."
  },
  {
    "question": "Which of these is NOT a source of $CO_2$ in a eukaryotic cell?",
    "options": [
      "Link Reaction",
      "Citric Acid Cycle",
      "Glycolysis",
      "Alcoholic fermentation"
    ],
    "answer": "Glycolysis",
    "explanation": "Glycolysis is a 10-step process that breaks a 6C sugar into two 3C acids; no carbon atoms are lost as $CO_2$ during this stage."
  },
  {
    "question": "What is the effect of high ATP concentrations on the rate of glycolysis?",
    "options": [
      "It speeds up glycolysis",
      "It inhibits PFK-1, slowing down glycolysis",
      "It has no effect on glycolysis",
      "It triggers the reversal of glycolysis into photosynthesis"
    ],
    "answer": "It inhibits PFK-1, slowing down glycolysis",
    "explanation": "ATP acts as an allosteric inhibitor for Phosphofructokinase. If the cell has plenty of energy (ATP), it shuts down glucose breakdown to save resources."
  },
  {
    "question": "Identify the molecule that serves as the 'high energy' carrier during the Link Reaction.",
    "options": [
      "NADPH",
      "FADH2",
      "NADH",
      "GTP"
    ],
    "answer": "NADH",
    "explanation": "The Link Reaction (Pyruvate oxidation) reduces NAD+ to NADH while releasing one $CO_2$."
  },
  {
    "question": "Which part of the mitochondria has the highest concentration of protons during active aerobic respiration?",
    "options": [
      "Matrix",
      "Inner membrane",
      "Intermembrane space",
      "Outer membrane"
    ],
    "answer": "Intermembrane space",
    "explanation": "The ETC pumps protons from the matrix into the intermembrane space, creating a steep electrochemical gradient used for ATP synthesis."
  },
  {
    "question": "In the Krebs cycle, the conversion of Succinyl-CoA to Succinate produces which energy-rich molecule in animal cells?",
    "options": [
      "ATP",
      "GTP",
      "NADH",
      "FADH2"
    ],
    "answer": "GTP",
    "explanation": "In many animal tissues, the energy released from breaking the thioester bond of Succinyl-CoA is used to phosphorylate GDP to GTP, which is later converted to ATP."
  },
  {
    "question": "Which of the following is the most reduced form of carbon?",
    "options": [
      "Carbon Dioxide ($CO_2$)",
      "Pyruvate",
      "Glucose ($C_6H_{12}O_6$)",
      "Methane ($CH_4$)"
    ],
    "answer": "Methane ($CH_4$)",
    "explanation": "Reduction is the gain of hydrogens. While not in the metabolic pathway, $CH_4$ is the most reduced. Within the pathway, Glucose is more reduced than Pyruvate or $CO_2$."
  },
  {
    "question": "An uncoupler (like DNP) makes the inner mitochondrial membrane 'leaky' to protons. What is the effect on ATP production and heat?",
    "options": [
      "ATP increases, Heat decreases",
      "ATP stops, Heat increases",
      "ATP stops, Heat stops",
      "ATP increases, Heat increases"
    ],
    "answer": "ATP stops, Heat increases",
    "explanation": "Uncouplers allow protons to bypass ATP Synthase. The energy from the gradient is released as heat instead of being used to make ATP, which is why DNP causes fatal overheating."
  }
];

async function insertMCQs() {
  const client = await pool.connect();
  try {
    const chapterId = 126; // Bio-energetics
    const lessonId = 1991; // Respiration Test 1

    let addedCount = 0;

    for (const mcq of mcqs) {
      const qText = mcq.question.trim();

      // Check for duplicates in Chapter 126
      const checkRes = await client.query(
        `SELECT id FROM mcqs WHERE chapter_id = $1 AND question_text = $2 AND is_active = TRUE`,
        [chapterId, qText]
      );

      if (checkRes.rows.length === 0) {
        // Find correct_opt index ('a', 'b', 'c', 'd')
        const optIndex = mcq.options.findIndex(o => o === mcq.answer);
        if (optIndex === -1) {
            console.log(`Warning: Could not match correct answer for "${qText.substring(0, 30)}..."`);
            continue;
        }
        const correctOptLetter = ['a', 'b', 'c', 'd'][optIndex];

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
        console.log(`Skipped (Duplicate): ${qText.substring(0, 50)}...`);
      }
    }

    console.log(`Successfully added ${addedCount} MCQs to Lesson 1991.`);

  } catch (err) {
    console.error('Error inserting MCQs:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

insertMCQs();
