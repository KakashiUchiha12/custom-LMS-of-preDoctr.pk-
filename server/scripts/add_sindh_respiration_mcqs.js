const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const mcqs = [
  {
    "question": "Which enzyme functions as both a carboxylase and an oxygenase depending on the CO2 concentration?",
    "options": ["Hexokinase", "RuBisCO", "Pyruvate dehydrogenase", "ATP synthase"],
    "answer": "RuBisCO",
    "explanation": "RuBisCO can catalyze the addition of CO2 to RuBP (carboxylation) or O2 to RuBP (oxygenation/photorespiration)."
  },
  {
    "question": "In the presence of light and low CO2 levels, RuBisCO combines RuBP with O2 to form one molecule of 3-PGA and one molecule of:",
    "options": ["Glucose", "Phosphoglycerate", "Phosphoglycolate", "Acetyl-CoA"],
    "answer": "Phosphoglycolate",
    "explanation": "When RuBisCO acts as an oxygenase, it produces one molecule of 3-phosphoglycerate and one molecule of phosphoglycolate."
  },
  {
    "question": "Cellular respiration is primarily a process of:",
    "options": ["Reduction", "Oxidation", "Carboxylation", "Hydrolysis"],
    "answer": "Oxidation",
    "explanation": "Respiration involves the breakdown of fuel molecules like glucose through oxidation to release energy."
  },
  {
    "question": "What is the primary energy 'currency' produced during cellular respiration?",
    "options": ["NADPH", "Glucose", "RuBP", "ATP"],
    "answer": "ATP",
    "explanation": "The energy released from the chemical bonds of glucose is captured and stored in the form of ATP."
  },
  {
    "question": "Anaerobic respiration is also commonly known as:",
    "options": ["Photorespiration", "Fermentation", "Chemiosmosis", "Phosphorylation"],
    "answer": "Fermentation",
    "explanation": "Respiration in the absence of oxygen is termed anaerobic respiration or fermentation."
  },
  {
    "question": "Which type of fermentation results in the production of Ethyl alcohol and CO2?",
    "options": ["Lactic acid fermentation", "Alcoholic fermentation", "Acetic acid fermentation", "Butyric fermentation"],
    "answer": "Alcoholic fermentation",
    "explanation": "Alcoholic fermentation, typical in yeast, breaks down pyruvate into ethyl alcohol and carbon dioxide."
  },
  {
    "question": "Lactic acid fermentation occurs in which human cells during extreme physical activity?",
    "options": ["Nerve cells", "Muscle cells", "Liver cells", "Skin cells"],
    "answer": "Muscle cells",
    "explanation": "In humans, muscle cells undergo lactic acid fermentation when oxygen supply is insufficient during strenuous exercise."
  },
  {
    "question": "Which phase of respiration is common to both aerobic and anaerobic pathways?",
    "options": ["Krebs cycle", "Electron Transport Chain", "Glycolysis", "Pyruvate oxidation"],
    "answer": "Glycolysis",
    "explanation": "Glycolysis is the universal first step where glucose is broken down into pyruvate without the requirement of oxygen."
  },
  {
    "question": "Glycolysis takes place in which part of the cell?",
    "options": ["Mitochondrial matrix", "Chloroplast", "Cytosol", "Nucleus"],
    "answer": "Cytosol",
    "explanation": "The enzymes required for glycolysis are located in the cytosol of the cell."
  },
  {
    "question": "The preparatory phase of glycolysis results in the consumption of how many ATP molecules?",
    "options": ["1", "2", "4", "0"],
    "answer": "2",
    "explanation": "Two molecules of ATP are used to phosphorylate glucose and fructose-6-phosphate during the initial steps."
  },
  {
    "question": "During the oxidative phase of glycolysis, what is the net gain of ATP molecules?",
    "options": ["1", "2", "4", "6"],
    "answer": "2",
    "explanation": "Four ATP are produced in the oxidative phase, but since two were consumed in the preparatory phase, the net gain is two."
  },
  {
    "question": "In glycolysis, one molecule of glucose is broken down into how many molecules of pyruvate?",
    "options": ["1", "2", "3", "4"],
    "answer": "2",
    "explanation": "Glucose (a 6-carbon sugar) is split into two 3-carbon pyruvate molecules."
  },
  {
    "question": "How many molecules of NADH are produced during glycolysis per molecule of glucose?",
    "options": ["1", "2", "3", "4"],
    "answer": "2",
    "explanation": "During the oxidative phase, two molecules of NAD+ are reduced to two molecules of NADH."
  },
  {
    "question": "What is the net ATP gain in anaerobic respiration (fermentation)?",
    "options": ["2 ATP", "4 ATP", "36 ATP", "38 ATP"],
    "answer": "2 ATP",
    "explanation": "Since anaerobic respiration only involves glycolysis, the net energy gain is limited to 2 ATP."
  },
  {
    "question": "In alcoholic fermentation, pyruvate is first converted into which 2-carbon compound before becoming ethanol?",
    "options": ["Lactate", "Acetyl", "Glycerate", "Phosphoglycerate"],
    "answer": "Acetyl",
    "explanation": "Pyruvate loses a carbon as CO2 to form an Acetyl/Acetaldehyde group which is then reduced to ethanol."
  },
  {
    "question": "Pyruvate enters the mitochondria for aerobic respiration and is first oxidized into:",
    "options": ["Citric acid", "Oxaloacetate", "Acetyl CoA", "Lactic acid"],
    "answer": "Acetyl CoA",
    "explanation": "In the mitochondrial matrix, pyruvate undergoes oxidative decarboxylation to form Acetyl CoA."
  },
  {
    "question": "The process of converting pyruvate into Acetyl CoA produces which byproduct?",
    "options": ["O2", "H2O", "CO2", "FADH2"],
    "answer": "CO2",
    "explanation": "Each pyruvate loses one carbon atom as carbon dioxide during its oxidation to Acetyl CoA."
  },
  {
    "question": "Who discovered the Citric Acid Cycle?",
    "options": ["Melvin Calvin", "H.A. Krebs", "Louis Pasteur", "Robert Hooke"],
    "answer": "H.A. Krebs",
    "explanation": "The Krebs cycle is named after H.A. Krebs, who discovered this series of metabolic reactions."
  },
  {
    "question": "The Krebs cycle begins when Acetyl CoA (2-carbon) combines with:",
    "options": ["Citrate", "Isocitrate", "Oxaloacetate", "Succinate"],
    "answer": "Oxaloacetate",
    "explanation": "Acetyl CoA joins with the 4-carbon oxaloacetate to form the 6-carbon citric acid."
  },
  {
    "question": "How many molecules of CO2 are released per turn of the Krebs cycle?",
    "options": ["1", "2", "3", "4"],
    "answer": "2",
    "explanation": "Two carbon atoms are released as CO2 during the decarboxylation steps of the cycle."
  },
  {
    "question": "Per turn of the Krebs cycle, how many NADH molecules are produced?",
    "options": ["1", "2", "3", "4"],
    "answer": "3",
    "explanation": "Three molecules of NAD+ are reduced to NADH during one complete turn of the Krebs cycle."
  },
  {
    "question": "How many FADH2 molecules are produced in a single turn of the Krebs cycle?",
    "options": ["1", "2", "3", "4"],
    "answer": "1",
    "explanation": "One molecule of FAD is reduced to FADH2 during the conversion of succinate to fumarate."
  },
  {
    "question": "What is the yield of ATP (or GTP) directly produced via substrate-level phosphorylation in one turn of the Krebs cycle?",
    "options": ["1", "2", "3", "4"],
    "answer": "1",
    "explanation": "One molecule of ATP (via GTP) is produced directly per turn of the cycle."
  },
  {
    "question": "Complete oxidation of one glucose molecule involves how many turns of the Krebs cycle?",
    "options": ["1", "2", "3", "4"],
    "answer": "2",
    "explanation": "Since one glucose produces two pyruvates, the cycle must turn twice for each glucose molecule."
  },
  {
    "question": "The Electron Transport Chain is located in which part of the mitochondria?",
    "options": ["Outer membrane", "Inner membrane (Cristae)", "Matrix", "Intermembrane space"],
    "answer": "Inner membrane (Cristae)",
    "explanation": "The respiratory chain and ATPase complexes are located on the inner mitochondrial membrane."
  },
  {
    "question": "What is the final electron acceptor in the aerobic Electron Transport Chain?",
    "options": ["CO2", "NADH", "Oxygen", "FADH2"],
    "answer": "Oxygen",
    "explanation": "Oxygen accepts the final electrons and protons to form water molecules."
  },
  {
    "question": "The mechanism of using a proton gradient to synthesize ATP is called:",
    "options": ["Glycolysis", "Carboxylation", "Chemiosmosis", "Fermentation"],
    "answer": "Chemiosmosis",
    "explanation": "Chemiosmosis describes the movement of ions (protons) across a semi-permeable membrane, down their electrochemical gradient, to generate ATP."
  },
  {
    "question": "How many total ATP molecules are generally considered the net gain from the complete aerobic oxidation of one glucose molecule?",
    "options": ["2", "32", "36", "38"],
    "answer": "36",
    "explanation": "The complete oxidation of glucose through glycolysis, Krebs cycle, and ETC typically yields 36 ATP in eukaryotic cells."
  },
  {
    "question": "Which molecule acts as a mobile electron carrier between complexes in the Electron Transport Chain?",
    "options": ["Co-enzyme Q", "ATP synthase", "RuBP", "PGA"],
    "answer": "Co-enzyme Q",
    "explanation": "Co-enzyme Q and various cytochromes act as electron carriers in the chain."
  },
  {
    "question": "Cytochrome oxidase complex transfers electrons from cytochrome a3 to:",
    "options": ["Cytochrome b", "Co-enzyme Q", "Oxygen", "NAD+"],
    "answer": "Oxygen",
    "explanation": "Cytochrome a3 is the final cytochrome in the chain which transfers electrons to oxygen."
  },
  {
    "question": "Proteins can enter the respiratory pathway after being broken down into:",
    "options": ["Fatty acids", "Glycerol", "Amino acids", "Glucose"],
    "answer": "Amino acids",
    "explanation": "Amino acids are formed from protein hydrolysis and enter various stages of the respiratory cycle."
  },
  {
    "question": "Fats are hydrolyzed into which two components before entering respiration?",
    "options": ["Amino acids and Sugars", "Glycerol and Fatty acids", "CO2 and H2O", "Starch and Cellulose"],
    "answer": "Glycerol and Fatty acids",
    "explanation": "Lipid metabolism breaks fats into glycerol and fatty acids."
  },
  {
    "question": "Fatty acids are typically converted into which molecule to enter the Krebs cycle?",
    "options": ["Pyruvate", "Acetyl-CoA", "Glucose", "Citrate"],
    "answer": "Acetyl-CoA",
    "explanation": "Fatty acids undergo beta-oxidation to form Acetyl-CoA, which enters the Krebs cycle."
  },
  {
    "question": "The process of removing an amino group (NH2) from an amino acid is known as:",
    "options": ["Carboxylation", "Deamination", "Phosphorylation", "Reduction"],
    "answer": "Deamination",
    "explanation": "When amino acids are used for energy, they undergo deamination to remove the ammonia group."
  },
  {
    "question": "Which intermediate in glycolysis is split into DHAP and 3-PGAI?",
    "options": ["Glucose-6-phosphate", "Fructose-1,6-biphosphate", "Phosphoenolpyruvate", "3-PGA"],
    "answer": "Fructose-1,6-biphosphate",
    "explanation": "Fructose-1,6-biphosphate (6 carbons) is split into two 3-carbon triose phosphates."
  },
  {
    "question": "The synthesis of ATP from ADP and Pi using energy from the ETC is called:",
    "options": ["Photophosphorylation", "Substrate-level phosphorylation", "Oxidative phosphorylation", "Photolysis"],
    "answer": "Oxidative phosphorylation",
    "explanation": "ATP production coupled with the oxidation of NADH and FADH2 in the ETC is oxidative phosphorylation."
  },
  {
    "question": "How many molecules of NADH are produced in the transition step (pyruvate oxidation) per glucose molecule?",
    "options": ["1", "2", "3", "4"],
    "answer": "2",
    "explanation": "Since two pyruvates are oxidized per glucose, two molecules of NADH are produced."
  },
  {
    "question": "Which enzyme complex acts as a 'proton pump' to generate the gradient for chemiosmosis?",
    "options": ["RuBisCO", "NADH dehydrogenase", "Aldolase", "Isomerase"],
    "answer": "NADH dehydrogenase",
    "explanation": "Complexes in the ETC like NADH dehydrogenase pump protons from the matrix to the intermembrane space."
  },
  {
    "question": "Glycerol from fats is converted into which respiratory intermediate?",
    "options": ["Acetyl-CoA", "Pyruvate", "3-phosphoglyceraldehyde (G3P)", "Citrate"],
    "answer": "3-phosphoglyceraldehyde (G3P)",
    "explanation": "Glycerol enters the glycolytic pathway at the level of triose phosphate (G3P)."
  },
  {
    "question": "The ammonia (NH3) produced during amino acid deamination is eventually excreted as:",
    "options": ["Glucose", "Starch", "Urea", "Lactic acid"],
    "answer": "Urea",
    "explanation": "Ammonia is processed through the urea cycle and excreted from the body."
  },
  {
    "question": "The term 'TCA cycle' stands for:",
    "options": ["Total Carbon Assimilation", "Tri-carboxylic Acid cycle", "Tri-carbon Acetyl cycle", "Tri-cyclic ATP cycle"],
    "answer": "Tri-carboxylic Acid cycle",
    "explanation": "The Krebs cycle is also called the TCA cycle because the first product, citric acid, has three carboxyl groups."
  },
  {
    "question": "What happens to the electrons as they move down the Electron Transport Chain?",
    "options": ["They gain energy", "They lose energy", "They stay at the same energy level", "They are converted to protons"],
    "answer": "They lose energy",
    "explanation": "Electrons move from higher to lower energy levels, and this released energy is used to pump protons."
  },
  {
    "question": "Oxidative phosphorylation occurs at which complex?",
    "options": ["Complex I", "Complex II", "Complex III", "ATPase complex"],
    "answer": "ATPase complex",
    "explanation": "The ATPase complex (or ATP synthase) uses the proton gradient to catalyze ATP synthesis."
  },
  {
    "question": "Per turn of the Krebs cycle, how many molecules of FAD are reduced?",
    "options": ["0", "1", "2", "3"],
    "answer": "1",
    "explanation": "Exactly one FADH2 is produced per turn of the cycle."
  },
  {
    "question": "Alcoholic fermentation is carried out by which group of organisms typically?",
    "options": ["Mammals", "Yeast", "Green plants", "Cyanobacteria"],
    "answer": "Yeast",
    "explanation": "Yeasts and some bacteria are well known for alcoholic fermentation."
  },
  {
    "question": "Which compound is the byproduct of photorespiration that is eventually broken down?",
    "options": ["CO2", "O2", "Glucose", "ATP"],
    "answer": "CO2",
    "explanation": "Photorespiration results in the release of CO2 without producing sugar or ATP."
  },
  {
    "question": "The total count of oxygen atoms required to oxidize one glucose molecule completely is:",
    "options": ["2", "6", "12", "18"],
    "answer": "12",
    "explanation": "6 molecules of O2 (12 oxygen atoms) are required to react with one molecule of glucose."
  },
  {
    "question": "Glucose-6-phosphate is converted to Fructose-6-phosphate during glycolysis by which process?",
    "options": ["Oxidation", "Reduction", "Isomerization", "Cleavage"],
    "answer": "Isomerization",
    "explanation": "Glucose-6-phosphate and Fructose-6-phosphate are isomers, and one is rearranged into the other."
  },
  {
    "question": "What is the net production of ATP in glycolysis if 4 ATP are produced?",
    "options": ["0", "2", "4", "6"],
    "answer": "2",
    "explanation": "Since 2 ATP are used in the first phase, producing 4 later gives a net of 2."
  },
  {
    "question": "Succinate is oxidized to fumarate in the Krebs cycle using which electron acceptor?",
    "options": ["NAD+", "NADP+", "FAD", "Oxygen"],
    "answer": "FAD",
    "explanation": "This specific step reduces FAD to FADH2."
  },
  {
    "question": "The total energy yield in terms of ATP from one molecule of NADH entering the ETC is approximately:",
    "options": ["1", "2", "3", "4"],
    "answer": "3",
    "explanation": "Each NADH oxidized in the ETC typically provides enough energy for the synthesis of 3 ATP molecules."
  },
  {
    "question": "How many ATP molecules are produced from one molecule of FADH2 in the ETC?",
    "options": ["1", "2", "3", "4"],
    "answer": "2",
    "explanation": "FADH2 oxidation yields approximately 2 ATP because it enters the chain at a later point (Complex II)."
  },
  {
    "question": "The conversion of Phosphoenolpyruvate (PEP) to pyruvate produces:",
    "options": ["NAD+", "ATP", "FADH2", "NADH"],
    "answer": "ATP",
    "explanation": "The final step of glycolysis produces one ATP per pyruvate molecule via substrate-level phosphorylation."
  },
  {
    "question": "In the absence of oxygen, pyruvate in human muscles is reduced to:",
    "options": ["Ethanol", "Lactate", "Acetyl-CoA", "CO2"],
    "answer": "Lactate",
    "explanation": "Lactic acid fermentation reduces pyruvate to lactate."
  },
  {
    "question": "Acetyl-CoA is a molecule containing how many carbons?",
    "options": ["1", "2", "3", "4"],
    "answer": "2",
    "explanation": "Acetyl is a 2-carbon group attached to Coenzyme A."
  },
  {
    "question": "The Krebs cycle takes place in which specific area of the mitochondria?",
    "options": ["Intermembrane space", "Inner membrane", "Mitochondrial matrix", "Outer membrane"],
    "answer": "Mitochondrial matrix",
    "explanation": "The enzymes for the Krebs cycle are located within the matrix fluid."
  },
  {
    "question": "What is the first stable product formed in the Krebs cycle?",
    "options": ["Oxaloacetate", "Malate", "Citrate", "Succinate"],
    "answer": "Citrate",
    "explanation": "Citric acid (Citrate) is formed first by the combination of Acetyl-CoA and oxaloacetate."
  },
  {
    "question": "Isocitrate is converted to alpha-ketoglutarate by removing:",
    "options": ["Oxygen", "Carbon dioxide", "Ammonia", "Water"],
    "answer": "Carbon dioxide",
    "explanation": "This is a decarboxylation step where one carbon is lost as CO2."
  },
  {
    "question": "Which molecule is regenerated at the end of the Krebs cycle?",
    "options": ["Acetyl-CoA", "Citrate", "Oxaloacetate", "Pyruvate"],
    "answer": "Oxaloacetate",
    "explanation": "Oxaloacetate is the starting and ending compound of the cycle."
  },
  {
    "question": "Protons move through the ATPase complex from the intermembrane space to the matrix by:",
    "options": ["Active transport", "Diffusion", "Osmosis", "Chemiosmosis"],
    "answer": "Chemiosmosis",
    "explanation": "The diffusion of protons through the ATP synthase is specifically called chemiosmosis."
  },
  {
    "question": "Aerobic respiration yields how many more ATP than anaerobic respiration per glucose molecule?",
    "options": ["2", "34", "36", "38"],
    "answer": "34",
    "explanation": "Aerobic (36) minus Anaerobic (2) equals 34 additional ATP."
  },
  {
    "question": "The total number of NADH produced from the complete oxidation of one glucose molecule is:",
    "options": ["2", "6", "10", "12"],
    "answer": "10",
    "explanation": "2 from glycolysis, 2 from pyruvate oxidation, and 6 from two turns of the Krebs cycle."
  },
  {
    "question": "How many CO2 molecules are produced from the complete oxidation of one glucose molecule?",
    "options": ["2", "4", "6", "12"],
    "answer": "6",
    "explanation": "Two from transition steps and four from the Krebs cycles."
  },
  {
    "question": "Water is formed at which stage of respiration?",
    "options": ["Glycolysis", "Krebs cycle", "Electron Transport Chain", "Transition step"],
    "answer": "Electron Transport Chain",
    "explanation": "Water is produced when oxygen accepts protons and electrons at the end of the ETC."
  },
  {
    "question": "In the absence of RuBisCO carboxylation, photorespiration occurs when oxygen levels are:",
    "options": ["Low", "High", "Absent", "Irrelevant"],
    "answer": "High",
    "explanation": "High oxygen concentrations relative to CO2 favor the oxygenase activity of RuBisCO."
  },
  {
    "question": "Amino acids that enter the respiratory cycle through pyruvate have how many carbons typically in their chain?",
    "options": ["2", "3", "4", "5"],
    "answer": "3",
    "explanation": "3-carbon amino acids are converted to the 3-carbon pyruvate."
  },
  {
    "question": "Which complex oxidizes FADH2 in the mitochondrial Electron Transport Chain?",
    "options": ["Complex I", "Complex II", "Complex III", "Complex IV"],
    "answer": "Complex II",
    "explanation": "FADH2 donates its electrons at Complex II."
  },
  {
    "question": "In glycolysis, the enzyme responsible for adding the first phosphate to glucose is:",
    "options": ["RuBisCO", "Hexokinase", "ATPase", "Aldolase"],
    "answer": "Hexokinase",
    "explanation": "Hexokinase catalyzes the phosphorylation of glucose to glucose-6-phosphate."
  },
  {
    "question": "The reduction of one molecule of NAD+ to NADH involves how many electrons?",
    "options": ["1", "2", "3", "4"],
    "answer": "2",
    "explanation": "Two electrons and one proton are transferred to NAD+ to form NADH."
  }
];

async function main() {
  const client = await pool.connect();
  try {
    const chapterId = 126; // Bio-energetics
    
    // 1. Find subject_id for chapter 126
    const subjectRes = await client.query('SELECT subject_id FROM chapters WHERE id = $1', [chapterId]);
    if (subjectRes.rows.length === 0) {
      console.error('Chapter 126 not found');
      return;
    }
    const subjectId = subjectRes.rows[0].subject_id;
    console.log(`Subject ID for chapter 126: ${subjectId}`);

    // 2. Check if lesson exists
    const title = "⚡Bio-energetics⚡[Respiration] 📚 Board Book Based MCQs SINDH📚";
    const lessonRes = await client.query('SELECT id FROM lessons WHERE title = $1 AND chapter_id = $2', [title, chapterId]);
    
    let lessonId;
    if (lessonRes.rows.length === 0) {
      console.log('Lesson not found. Creating it...');
      const orderRes = await client.query('SELECT MAX(order_index) as max_order FROM lessons WHERE chapter_id = $1', [chapterId]);
      const nextOrder = (orderRes.rows[0].max_order || 0) + 1;
      
      const wpIdRes = await client.query('SELECT MIN(wp_id) as min_wp FROM lessons');
      const nextWpId = Math.min(0, wpIdRes.rows[0].min_wp || 0) - 1;
      
      const insertRes = await client.query(
        `INSERT INTO lessons (wp_id, chapter_id, subject_id, title, lesson_type, lesson_sub, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [nextWpId, chapterId, subjectId, title, 'board_book', 'Sindh', nextOrder]
      );
      lessonId = insertRes.rows[0].id;
      console.log(`Created lesson with ID: ${lessonId}`);
    } else {
      lessonId = lessonRes.rows[0].id;
      console.log(`Found existing lesson with ID: ${lessonId}`);
    }

    let addedCount = 0;
    let duplicateCount = 0;

    for (const mcq of mcqs) {
      const qText = mcq.question.trim();

      // Check for duplicates in Chapter 126
      const checkRes = await client.query(
        `SELECT id FROM mcqs WHERE chapter_id = $1 AND question_text = $2 AND is_active = TRUE`,
        [chapterId, qText]
      );

      if (checkRes.rows.length === 0) {
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
        duplicateCount++;
      }
    }

    console.log(`Successfully added ${addedCount} MCQs.`);
    console.log(`Skipped ${duplicateCount} duplicates.`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
