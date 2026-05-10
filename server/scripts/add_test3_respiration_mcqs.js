const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const mcqs = [
  {
    "question": "Which specific enzyme catalyzes the first substrate-level phosphorylation in the glycolytic pathway?",
    "options": [
      "A) Hexokinase",
      "B) Phosphofructokinase",
      "C) Phosphoglycerate kinase",
      "D) Pyruvate kinase"
    ],
    "answer": "C",
    "explanation": "Phosphoglycerate kinase transfers a high-energy phosphate group from 1,3-bisphosphoglycerate to ADP, forming the first ATP of the payoff phase."
  },
  {
    "question": "In the presence of an uncoupling agent like DNP, what is the immediate effect on the mitochondrial electron transport chain?",
    "options": [
      "A) Electron flow stops immediately",
      "B) Oxygen consumption increases while ATP synthesis stops",
      "C) The proton gradient becomes steeper",
      "D) NADH oxidation is inhibited"
    ],
    "answer": "B",
    "explanation": "Uncouplers allow protons to leak back into the matrix without passing through ATP synthase; the ETC continues to pump protons (consuming oxygen) but no ATP is made."
  },
  {
    "question": "What is the net gain of ATP when one molecule of Fructose-1,6-bisphosphate is converted to two molecules of pyruvate?",
    "options": [
      "A) 2 ATP",
      "B) 4 ATP",
      "C) 36 ATP",
      "D) 0 ATP"
    ],
    "answer": "B",
    "explanation": "Since the molecule is already phosphorylated to F-1,6-BP, the 'investment phase' (which consumes 2 ATP) is bypassed, leaving the 4 ATP produced in the payoff phase as net gain."
  },
  {
    "question": "Which component of the Electron Transport Chain (ETC) is a peripheral membrane protein that moves along the outer surface of the inner mitochondrial membrane?",
    "options": [
      "A) Ubiquinone (Coenzyme Q)",
      "B) Cytochrome c",
      "C) Complex III",
      "D) Complex IV"
    ],
    "answer": "B",
    "explanation": "Cytochrome c is a water-soluble peripheral protein, whereas Ubiquinone is a lipid-soluble molecule residing within the membrane bilayer."
  },
  {
    "question": "How many decarboxylation reactions occur for a single turn of the Citric Acid (TCA) Cycle?",
    "options": [
      "A) 1",
      "B) 2",
      "C) 3",
      "D) 4"
    ],
    "answer": "B",
    "explanation": "Decarboxylation occurs during the conversion of Isocitrate to Alpha-ketoglutarate and Alpha-ketoglutarate to Succinyl-CoA."
  },
  {
    "question": "Which enzyme acts as a bridge between the Citric Acid Cycle and the Electron Transport Chain?",
    "options": [
      "A) Isocitrate dehydrogenase",
      "B) Succinate dehydrogenase",
      "C) Malate dehydrogenase",
      "D) Citrate synthase"
    ],
    "answer": "B",
    "explanation": "Succinate dehydrogenase is the only enzyme that is both a component of the TCA cycle and Complex II of the ETC."
  },
  {
    "question": "In alcoholic fermentation, what is the role of NADH during the reduction of acetaldehyde to ethanol?",
    "options": [
      "A) It acts as an oxidizing agent",
      "B) It acts as a reducing agent",
      "C) It provides the phosphate group",
      "D) It catalyzes the reaction"
    ],
    "answer": "B",
    "explanation": "NADH provides the electrons/hydrogen necessary to reduce acetaldehyde to ethanol, being oxidized to NAD+ in the process."
  },
  {
    "question": "Which molecule is the direct competitive inhibitor of Succinate dehydrogenase in the TCA cycle?",
    "options": [
      "A) Malate",
      "B) Malonate",
      "C) Oxaloacetate",
      "D) Citrate"
    ],
    "answer": "B",
    "explanation": "Malonate is a structural analog of succinate and acts as a classic competitive inhibitor for this enzyme."
  },
  {
    "question": "During aerobic respiration, what is the total number of NADH molecules generated from the complete oxidation of one glucose molecule?",
    "options": [
      "A) 6",
      "B) 8",
      "C) 10",
      "D) 12"
    ],
    "answer": "C",
    "explanation": "2 from Glycolysis, 2 from the Link Reaction (Pyruvate oxidation), and 6 from the TCA cycle (3 per turn)."
  },
  {
    "question": "What is the theoretical yield of ATP from one molecule of FADH2 when it enters the mitochondrial ETC?",
    "options": [
      "A) 1 ATP",
      "B) 2 ATP",
      "C) 3 ATP",
      "D) 4 ATP"
    ],
    "answer": "B",
    "explanation": "FADH2 enters at Complex II, bypassing the first proton pump (Complex I), thus generating fewer protons for the gradient compared to NADH."
  },
  {
    "question": "The 'chemiosmotic' coupling of the ETC to ATP synthesis requires which of the following?",
    "options": [
      "A) A permeable inner membrane",
      "B) An intact and impermeable inner membrane to protons",
      "C) A high pH in the intermembrane space",
      "D) Oxidation of water"
    ],
    "answer": "B",
    "explanation": "The membrane must be impermeable to protons so that the gradient can only be dissipated through the ATP synthase 'turbine'."
  },
  {
    "question": "In the payoff phase of glycolysis, which enzyme catalyzes the dehydration of 2-phosphoglycerate to phosphoenolpyruvate (PEP)?",
    "options": [
      "A) Mutase",
      "B) Enolase",
      "C) Aldolase",
      "D) Isomerase"
    ],
    "answer": "B",
    "explanation": "Enolase facilitates the removal of a water molecule to create the high-energy bond in PEP."
  },
  {
    "question": "Which of the following describes the thermodynamic nature of cellular respiration?",
    "options": [
      "A) Endergonic and Anabolic",
      "B) Exergonic and Catabolic",
      "C) Endergonic and Catabolic",
      "D) Exergonic and Anabolic"
    ],
    "answer": "B",
    "explanation": "Respiration breaks down complex molecules (catabolic) and releases free energy (exergonic)."
  },
  {
    "question": "Which of the following compounds is the most 'oxidized' form of carbon produced during cellular metabolism?",
    "options": [
      "A) Glucose",
      "B) Pyruvate",
      "C) Acetyl-CoA",
      "D) Carbon Dioxide"
    ],
    "answer": "D",
    "explanation": "In CO2, the carbon atom is in its highest oxidation state (+4)."
  },
  {
    "question": "What is the primary function of the 'Link Reaction' in aerobic respiration?",
    "options": [
      "A) To produce ATP via substrate-level phosphorylation",
      "B) To convert a 3-carbon molecule into a 2-carbon molecule attached to a coenzyme",
      "C) To reduce FAD to FADH2",
      "D) To pump protons into the intermembrane space"
    ],
    "answer": "B",
    "explanation": "The Link reaction oxidizes pyruvate (3C) to an acetyl group (2C) and attaches it to Coenzyme A."
  },
  {
    "question": "Which enzyme in the TCA cycle catalyzes a reaction that produces GTP in animal cells?",
    "options": [
      "A) Citrate synthase",
      "B) Isocitrate dehydrogenase",
      "C) Succinyl-CoA synthetase",
      "D) Fumarase"
    ],
    "answer": "C",
    "explanation": "Succinyl-CoA synthetase (also called succinate thiokinase) couples the cleavage of Succinyl-CoA to the phosphorylation of GDP to GTP."
  },
  {
    "question": "During heavy exercise, if the rate of glycolysis exceeds the rate of the TCA cycle, what compound accumulates in the cytosol?",
    "options": [
      "A) Acetyl-CoA",
      "B) Oxaloacetate",
      "C) Lactate",
      "D) Citrate"
    ],
    "answer": "C",
    "explanation": "Excess pyruvate is converted to lactate to regenerate NAD+ so that glycolysis can continue anaerobically."
  },
  {
    "question": "The total number of ATP molecules produced by 'oxidative phosphorylation' from one glucose molecule is approximately:",
    "options": [
      "A) 2-4",
      "B) 10-12",
      "C) 32-34",
      "D) 38"
    ],
    "answer": "C",
    "explanation": "Out of the 36-38 total, 4 are from substrate-level phosphorylation; the remainder (approx. 32-34) are from oxidative phosphorylation via the ETC."
  },
  {
    "question": "Which complex of the ETC contains a copper-containing center and reduces oxygen to water?",
    "options": [
      "A) Complex I",
      "B) Complex II",
      "C) Complex III",
      "D) Complex IV"
    ],
    "answer": "D",
    "explanation": "Complex IV (Cytochrome c oxidase) contains Cu centers and Cytochromes a and a3."
  },
  {
    "question": "What happens to the Respiratory Quotient (RQ) when a cell shifts from metabolizing glucose to metabolizing fats?",
    "options": [
      "A) It increases toward 1.0",
      "B) It decreases toward 0.7",
      "C) It stays exactly the same",
      "D) It increases toward 1.5"
    ],
    "answer": "B",
    "explanation": "Glucose has an RQ of 1.0, while fats (which require more oxygen for oxidation) have an RQ of roughly 0.7."
  },
  {
    "question": "Which enzyme is responsible for 'trapping' glucose inside the cell by adding a phosphate group?",
    "options": [
      "A) Enolase",
      "B) Hexokinase",
      "C) Aldolase",
      "D) Pyruvate kinase"
    ],
    "answer": "B",
    "explanation": "Hexokinase converts glucose to glucose-6-phosphate, which cannot easily cross the cell membrane."
  },
  {
    "question": "In the absence of oxygen, the net ATP yield from one sucrose molecule is:",
    "options": [
      "A) 2 ATP",
      "B) 4 ATP",
      "C) 36 ATP",
      "D) 0 ATP"
    ],
    "answer": "B",
    "explanation": "Sucrose consists of glucose + fructose. Each hexose yields 2 net ATP via glycolysis/fermentation; thus, 2 + 2 = 4."
  },
  {
    "question": "The folding of the inner mitochondrial membrane into cristae primarily serves to:",
    "options": [
      "A) Protect the DNA in the matrix",
      "B) Increase the surface area for ETC and ATP synthase complexes",
      "C) Decrease the volume of the intermembrane space",
      "D) Filter out toxins from the cytoplasm"
    ],
    "answer": "B",
    "explanation": "More surface area allows for a higher number of respiratory assemblies, increasing the cell's capacity for ATP production."
  },
  {
    "question": "Which 4-carbon intermediate is produced by the hydration of Fumarate in the TCA cycle?",
    "options": [
      "A) Malate",
      "B) Succinate",
      "C) Oxaloacetate",
      "D) Citrate"
    ],
    "answer": "A",
    "explanation": "Fumarase catalyzes the addition of a water molecule to fumarate to form malate."
  },
  {
    "question": "What is the fate of the three carbons in pyruvate after complete aerobic respiration?",
    "options": [
      "A) They are converted to ethanol",
      "B) They are released as three molecules of CO2",
      "C) They are recycled back to glucose",
      "D) They are used to make ATP"
    ],
    "answer": "B",
    "explanation": "Every carbon in glucose eventually ends up as a CO2 molecule during the Link and TCA reactions."
  },
  {
    "question": "Which molecule acts as an allosteric inhibitor of Phosphofructokinase (PFK) to slow down glycolysis when energy levels are high?",
    "options": [
      "A) AMP",
      "B) ADP",
      "C) ATP",
      "D) NAD+"
    ],
    "answer": "C",
    "explanation": "ATP binds to an allosteric site on PFK to decrease its activity, functioning as a feedback inhibition mechanism."
  },
  {
    "question": "Cytochrome a3 is directly oxidized by which of the following?",
    "options": [
      "A) Cytochrome c",
      "B) Coenzyme Q",
      "C) Molecular Oxygen",
      "D) Water"
    ],
    "answer": "C",
    "explanation": "Cytochrome a3 transfers its electrons directly to oxygen, the final acceptor."
  },
  {
    "question": "How many molecules of FADH2 are produced during the complete oxidation of one molecule of glucose?",
    "options": [
      "A) 1",
      "B) 2",
      "C) 4",
      "D) 6"
    ],
    "answer": "B",
    "explanation": "One FADH2 is produced per pyruvate in the TCA cycle; glucose yields two pyruvates."
  },
  {
    "question": "What is the energy change ($\DeltaG$) for the hydrolysis of ATP to ADP under standard conditions?",
    "options": [
      "A) +7.3 kcal/mol",
      "B) -7.3 kcal/mol",
      "C) -31 kcal/mol",
      "D) 0 kcal/mol"
    ],
    "answer": "B",
    "explanation": "Standard free energy change is approximately -7.3 kcal/mol (or -30.5 kJ/mol), reflecting an exergonic reaction."
  },
  {
    "question": "Which enzyme splits Fructose-1,6-bisphosphate into two 3-carbon sugars?",
    "options": [
      "A) Isomerase",
      "B) Aldolase",
      "C) Mutase",
      "D) Kinase"
    ],
    "answer": "B",
    "explanation": "Aldolase cleaves the 6-carbon sugar into G3P and DHAP."
  },
  {
    "question": "Where are the enzymes for the Citric Acid Cycle located in a eukaryotic cell?",
    "options": [
      "A) Cytosol",
      "B) Intermembrane space",
      "C) Inner membrane",
      "D) Mitochondrial Matrix"
    ],
    "answer": "D",
    "explanation": "The matrix contains the dissolved enzymes for the Link reaction and TCA cycle (except Succinate dehydrogenase)."
  },
  {
    "question": "In the Electron Transport Chain, which complex does NOT pump protons across the membrane?",
    "options": [
      "A) Complex I",
      "B) Complex II",
      "C) Complex III",
      "D) Complex IV"
    ],
    "answer": "B",
    "explanation": "Complex II (Succinate dehydrogenase) transfers electrons but does not release enough energy to pump protons."
  },
  {
    "question": "Which of the following represents a correct sequence of electron flow in the ETC?",
    "options": [
      "A) NADH -> Complex II -> Complex III",
      "B) FADH2 -> Complex I -> CoQ",
      "C) NADH -> Complex I -> CoQ -> Complex III",
      "D) CoQ -> Complex I -> NADH"
    ],
    "answer": "C",
    "explanation": "Electrons from NADH enter at Complex I and are passed to Coenzyme Q, then to Complex III."
  },
  {
    "question": "What is the number of ATP molecules produced per glucose if only the Krebs cycle is considered (via substrate-level phosphorylation)?",
    "options": [
      "A) 1",
      "B) 2",
      "C) 4",
      "D) 34"
    ],
    "answer": "B",
    "explanation": "Each turn produces 1 GTP/ATP; two pyruvates mean two turns, so 2 ATP."
  },
  {
    "question": "The process where a phosphate group is transferred directly from a reactive intermediate to ADP is called:",
    "options": [
      "A) Photophosphorylation",
      "B) Oxidative phosphorylation",
      "C) Substrate-level phosphorylation",
      "D) Chemiosmosis"
    ],
    "answer": "C",
    "explanation": "This occurs in glycolysis and the TCA cycle, distinct from the ATP produced by the proton gradient."
  }
];

function cleanOption(opt) {
  if (!opt) return opt;
  return opt.replace(/^[A-D]\)\s*/, '');
}

async function insertMCQs() {
  const client = await pool.connect();
  try {
    const chapterId = 126; // Bio-energetics
    const lessonId = 1993; // Respiration Test 3

    let addedCount = 0;

    for (const mcq of mcqs) {
      const qText = mcq.question.trim();

      // Check for duplicates in Chapter 126
      const checkRes = await client.query(
        `SELECT id FROM mcqs WHERE chapter_id = $1 AND question_text = $2 AND is_active = TRUE`,
        [chapterId, qText]
      );

      if (checkRes.rows.length === 0) {
        // Map answer 'A' to 'a', etc.
        const correctOptLetter = mcq.answer.toLowerCase();

        const optA = cleanOption(mcq.options[0]);
        const optB = cleanOption(mcq.options[1]);
        const optC = cleanOption(mcq.options[2]);
        const optD = cleanOption(mcq.options[3]);

        await client.query(`
          INSERT INTO mcqs (
            subject, chapter, chapter_id, lesson_id, 
            question_text, option_a, option_b, option_c, option_d, 
            correct_opt, explanation, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          'Biology', 'Bio-energetics', chapterId, lessonId,
          qText, optA, optB, optC, optD,
          correctOptLetter, mcq.explanation, true
        ]);
        
        addedCount++;
      } else {
        console.log(`Skipped (Duplicate in Chapter): ${qText.substring(0, 50)}...`);
      }
    }

    console.log(`Successfully added ${addedCount} MCQs to Lesson 1993.`);

  } catch (err) {
    console.error('Error inserting MCQs:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

insertMCQs();
