const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const mcqs = [
  {
    "question": "Which specific cofactor is required by the enzyme Glyceraldehyde-3-phosphate dehydrogenase during the energy-yielding phase of glycolysis?",
    "options": [
      "FAD",
      "NADP+",
      "NAD+",
      "Coenzyme A"
    ],
    "answer": "NAD+",
    "explanation": "G3P dehydrogenase reduces NAD+ to NADH while simultaneously adding an inorganic phosphate to the substrate."
  },
  {
    "question": "During the Link Reaction, the oxidative decarboxylation of pyruvate results in the reduction of which molecule?",
    "options": [
      "Oxygen",
      "Oxaloacetate",
      "NAD+",
      "FAD"
    ],
    "answer": "NAD+",
    "explanation": "As pyruvate is converted into an acetyl group and CO2 is released, NAD+ is reduced to form NADH."
  },
  {
    "question": "Which of the following is the only enzyme of the Krebs cycle that is bound to the inner mitochondrial membrane rather than being free in the matrix?",
    "options": [
      "Citrate synthase",
      "Isocitrate dehydrogenase",
      "Succinate dehydrogenase",
      "Malate dehydrogenase"
    ],
    "answer": "Succinate dehydrogenase",
    "explanation": "Succinate dehydrogenase also functions as Complex II of the electron transport chain, linking the Krebs cycle directly to the ETC."
  },
  {
    "question": "What is the net yield of ATP molecules produced through substrate-level phosphorylation during the complete aerobic oxidation of one glucose molecule?",
    "options": [
      "2 ATP",
      "4 ATP",
      "34 ATP",
      "38 ATP"
    ],
    "answer": "4 ATP",
    "explanation": "Substrate-level phosphorylation occurs twice in glycolysis (net 2 ATP) and twice in the Krebs cycle (2 ATP per glucose), totaling 4 ATP."
  },
  {
    "question": "In the electron transport chain, which component acts as a mobile carrier between Complex I and Complex III?",
    "options": [
      "Cytochrome c",
      "Ubiquinone (Coenzyme Q)",
      "Plastocyanin",
      "NADH dehydrogenase"
    ],
    "answer": "Ubiquinone (Coenzyme Q)",
    "explanation": "Ubiquinone is a lipid-soluble mobile carrier that transfers electrons from both Complex I and Complex II to Complex III."
  },
  {
    "question": "Which stage of aerobic respiration involves the production of the most carbon dioxide molecules?",
    "options": [
      "Glycolysis",
      "Link Reaction",
      "Krebs Cycle",
      "Electron Transport Chain"
    ],
    "answer": "Krebs Cycle",
    "explanation": "The Krebs cycle releases 4 molecules of CO2 per glucose (2 per turn), while the Link Reaction only releases 2."
  },
  {
    "question": "Identify the 4-carbon compound that accepts Acetyl-CoA at the beginning of the Citric Acid Cycle.",
    "options": [
      "Citrate",
      "Alpha-ketoglutarate",
      "Oxaloacetate",
      "Succinate"
    ],
    "answer": "Oxaloacetate",
    "explanation": "Acetyl-CoA (2C) combines with Oxaloacetate (4C) to form the 6-carbon Citrate molecule."
  },
  {
    "question": "During anaerobic respiration in yeast, which enzyme is responsible for the conversion of pyruvate into acetaldehyde?",
    "options": [
      "Pyruvate decarboxylase",
      "Alcohol dehydrogenase",
      "Lactate dehydrogenase",
      "Hexokinase"
    ],
    "answer": "Pyruvate decarboxylase",
    "explanation": "Pyruvate decarboxylase removes a CO2 molecule from pyruvate to form acetaldehyde, which is later reduced to ethanol."
  },
  {
    "question": "What is the specific orientation of proton pumping in the mitochondria to establish the electrochemical gradient?",
    "options": [
      "From the intermembrane space to the matrix",
      "From the matrix to the intermembrane space",
      "From the cytoplasm to the matrix",
      "From the inner membrane to the outer membrane"
    ],
    "answer": "From the matrix to the intermembrane space",
    "explanation": "Complexes I, III, and IV pump protons from the mitochondrial matrix into the intermembrane space."
  },
  {
    "question": "How many molecules of water are theoretically produced during the complete oxidation of one glucose molecule in aerobic respiration?",
    "options": [
      "2",
      "6",
      "12",
      "38"
    ],
    "answer": "6",
    "explanation": "The balanced chemical equation for aerobic respiration is C6H12O6 + 6O2 -> 6CO2 + 6H2O + Energy."
  },
  {
    "question": "Which complex in the Electron Transport Chain does NOT act as a proton pump?",
    "options": [
      "Complex I",
      "Complex II",
      "Complex III",
      "Complex IV"
    ],
    "answer": "Complex II",
    "explanation": "Complex II (Succinate dehydrogenase) transfers electrons but does not have enough energy release to pump protons across the membrane."
  },
  {
    "question": "Cyanide poisoning inhibits aerobic respiration by binding to which specific component?",
    "options": [
      "NADH dehydrogenase",
      "ATP Synthase",
      "Cytochrome c oxidase (Complex IV)",
      "Coenzyme Q"
    ],
    "answer": "Cytochrome c oxidase (Complex IV)",
    "explanation": "Cyanide binds to the iron within Cytochrome c oxidase, preventing the final transfer of electrons to oxygen."
  },
  {
    "question": "In the 'Investment Phase' of glycolysis, which enzyme is responsible for the second phosphorylation event?",
    "options": [
      "Hexokinase",
      "Phosphofructokinase-1",
      "Aldolase",
      "Phosphoglycerate kinase"
    ],
    "answer": "Phosphofructokinase-1",
    "explanation": "Phosphofructokinase-1 (PFK-1) phosphorylates Fructose-6-phosphate into Fructose-1,6-bisphosphate using one ATP."
  },
  {
    "question": "What is the chemical nature of the prosthetic group in Cytochromes that allows them to transport electrons?",
    "options": [
      "Magnesium-porphyrin",
      "Iron-porphyrin (Heme)",
      "Copper-sulfur cluster",
      "Zinc-finger"
    ],
    "answer": "Iron-porphyrin (Heme)",
    "explanation": "Cytochromes contain a heme group with an iron atom that alternates between Fe2+ and Fe3+ states during electron transfer."
  },
  {
    "question": "Which of the following describes the relationship between the Krebs Cycle and the Electron Transport Chain?",
    "options": [
      "The Krebs cycle produces ATP for the ETC",
      "The Krebs cycle provides NADH and FADH2 to the ETC",
      "The ETC provides CO2 to the Krebs cycle",
      "The ETC occurs in the matrix while Krebs occurs in the cristae"
    ],
    "answer": "The Krebs cycle provides NADH and FADH2 to the ETC",
    "explanation": "The primary role of the Krebs cycle is to harvest high-energy electrons and transfer them to NAD+ and FAD for use in the ETC."
  },
  {
    "question": "During lactic acid fermentation, what is the fate of the NADH produced in glycolysis?",
    "options": [
      "It is used to produce CO2",
      "It is oxidized back to NAD+ by reducing pyruvate",
      "It enters the mitochondria for the ETC",
      "It is converted into ATP via chemiosmosis"
    ],
    "answer": "It is oxidized back to NAD+ by reducing pyruvate",
    "explanation": "To keep glycolysis running in anaerobic conditions, NADH must be oxidized back to NAD+; in muscles, this is done by reducing pyruvate to lactate."
  },
  {
    "question": "The total number of NADH molecules produced from one molecule of glucose during the Krebs cycle is:",
    "options": [
      "2",
      "3",
      "6",
      "10"
    ],
    "answer": "6",
    "explanation": "Each turn of the Krebs cycle produces 3 NADH. Since one glucose yields two pyruvates, the cycle turns twice, producing 6 NADH."
  },
  {
    "question": "Which molecule is the direct source of energy for the rotation of the ATP Synthase stalk?",
    "options": [
      "The breakdown of ATP",
      "The movement of electrons",
      "The proton motive force (H+ gradient)",
      "The oxidation of NADH"
    ],
    "answer": "The proton motive force (H+ gradient)",
    "explanation": "Protons flowing through the F0 subunit of ATP Synthase provide the energy to rotate the enzyme and synthesize ATP (Chemiosmosis)."
  },
  {
    "question": "What is the three-carbon intermediate produced when Fructose-1,6-bisphosphate is cleaved by the enzyme Aldolase?",
    "options": [
      "3-phosphoglycerate",
      "Dihydroxyacetone phosphate",
      "Phosphoenolpyruvate",
      "Glucose-3-phosphate"
    ],
    "answer": "Dihydroxyacetone phosphate",
    "explanation": "Aldolase splits the 6C sugar into two 3C sugars: G3P and DHAP."
  },
  {
    "question": "In aerobic respiration, approximately what percentage of the energy stored in a glucose molecule is successfully captured in ATP?",
    "options": [
      "2%",
      "25%",
      "40%",
      "95%"
    ],
    "answer": "40%",
    "explanation": "Aerobic respiration is roughly 38-40% efficient; the rest of the energy is lost as heat."
  },
  {
    "question": "Which enzyme converts malate back into oxaloacetate in the final step of the Krebs cycle?",
    "options": [
      "Malate dehydrogenase",
      "Fumarase",
      "Succinate thiokinase",
      "Citrate synthase"
    ],
    "answer": "Malate dehydrogenase",
    "explanation": "Malate dehydrogenase oxidizes malate to oxaloacetate while reducing NAD+ to NADH."
  },
  {
    "question": "The 'chemiosmotic theory' of ATP synthesis was proposed by:",
    "options": [
      "Hans Krebs",
      "Peter Mitchell",
      "Louis Pasteur",
      "Melvin Calvin"
    ],
    "answer": "Peter Mitchell",
    "explanation": "Peter Mitchell received the Nobel Prize for his theory explaining how electrochemical gradients power ATP synthesis."
  },
  {
    "question": "Which of the following can act as a respiratory substrate if glucose levels are depleted?",
    "options": [
      "Fatty acids",
      "Amino acids",
      "Glycerol",
      "All of the above"
    ],
    "answer": "All of the above",
    "explanation": "Cells can metabolize lipids (fatty acids/glycerol) and proteins (amino acids) by feeding them into different stages of glycolysis or the Krebs cycle."
  },
  {
    "question": "What is the net ATP production when one molecule of glucose undergoes fermentation into lactic acid?",
    "options": [
      "0 ATP",
      "2 ATP",
      "4 ATP",
      "36 ATP"
    ],
    "answer": "2 ATP",
    "explanation": "Fermentation itself produces no ATP; the 2 net ATP are produced solely during the preceding glycolysis stage."
  },
  {
    "question": "Which component of the Electron Transport Chain contains copper and is directly involved in the reduction of oxygen?",
    "options": [
      "Cytochrome b",
      "Cytochrome c",
      "Cytochrome a3",
      "Coenzyme Q"
    ],
    "answer": "Cytochrome a3",
    "explanation": "Cytochrome a3 (part of Complex IV) contains a copper center that facilitates the transfer of electrons to molecular oxygen."
  },
  {
    "question": "If the inner mitochondrial membrane becomes 'leaky' to protons due to an uncoupling agent, what will happen to the energy released from the ETC?",
    "options": [
      "It will produce more ATP",
      "It will be lost as heat",
      "It will be stored as fat",
      "The ETC will stop immediately"
    ],
    "answer": "It will be lost as heat",
    "explanation": "Uncouplers allow protons to return to the matrix without passing through ATP Synthase, dissipating the gradient energy as heat."
  },
  {
    "question": "How many molecules of FADH2 are produced during the complete oxidation of one glucose molecule?",
    "options": [
      "1",
      "2",
      "6",
      "10"
    ],
    "answer": "2",
    "explanation": "One molecule of FADH2 is produced per turn of the Krebs cycle. Since glucose yields two pyruvates, the total is 2 FADH2."
  },
  {
    "question": "Which specific reaction in glycolysis is irreversible under physiological conditions?",
    "options": [
      "Glucose to Glucose-6-phosphate",
      "3-phosphoglycerate to 2-phosphoglycerate",
      "G3P to DHAP",
      "Fructose-1,6-bisphosphate to G3P"
    ],
    "answer": "Glucose to Glucose-6-phosphate",
    "explanation": "The phosphorylation of glucose by hexokinase is a highly exergonic, irreversible step that traps glucose inside the cell."
  },
  {
    "question": "What is the total number of decarboxylation events that occur for a single molecule of pyruvate entering aerobic respiration?",
    "options": [
      "1",
      "2",
      "3",
      "6"
    ],
    "answer": "3",
    "explanation": "One CO2 is released in the Link Reaction and two CO2 are released in the Krebs Cycle for each pyruvate molecule."
  },
  {
    "question": "Which of the following is a 5-carbon compound found in the Citric Acid Cycle?",
    "options": [
      "Succinate",
      "Isocitrate",
      "Alpha-ketoglutarate",
      "Fumarate"
    ],
    "answer": "Alpha-ketoglutarate",
    "explanation": "Alpha-ketoglutarate is formed after the decarboxylation of isocitrate (6C) and before it is converted to succinyl-CoA (4C)."
  },
  {
    "question": "During glycolysis, the conversion of Phosphoenolpyruvate (PEP) to Pyruvate results in the production of:",
    "options": [
      "NADH",
      "CO2",
      "ATP",
      "FADH2"
    ],
    "answer": "ATP",
    "explanation": "This is the second substrate-level phosphorylation step in glycolysis, catalyzed by pyruvate kinase."
  },
  {
    "question": "In the Krebs cycle, which enzyme produces GTP (or ATP) via substrate-level phosphorylation?",
    "options": [
      "Citrate synthase",
      "Succinyl-CoA synthetase",
      "Aconitase",
      "Fumarase"
    ],
    "answer": "Succinyl-CoA synthetase",
    "explanation": "Succinyl-CoA synthetase (also called succinate thiokinase) converts Succinyl-CoA to Succinate, releasing energy to form GTP or ATP."
  },
  {
    "question": "Which of the following is NOT true about the outer mitochondrial membrane?",
    "options": [
      "It is highly permeable to small molecules",
      "It contains porin proteins",
      "It contains the enzymes of the ETC",
      "It encloses the intermembrane space"
    ],
    "answer": "It contains the enzymes of the ETC",
    "explanation": "The enzymes and complexes of the ETC are located in the inner mitochondrial membrane (cristae), not the outer membrane."
  },
  {
    "question": "What is the yield of ATP from one molecule of FADH2 entering the Electron Transport Chain?",
    "options": [
      "1 ATP",
      "2 ATP",
      "3 ATP",
      "4 ATP"
    ],
    "answer": "2 ATP",
    "explanation": "FADH2 enters at Complex II and bypasses one proton pump, resulting in the production of approximately 2 ATP compared to 3 for NADH."
  },
  {
    "question": "A cell with high levels of ATP will likely show a decrease in the activity of which glycolytic enzyme due to allosteric inhibition?",
    "options": [
      "Hexokinase",
      "Phosphofructokinase-1",
      "Enolase",
      "Aldolase"
    ],
    "answer": "Phosphofructokinase-1",
    "explanation": "ATP acts as an allosteric inhibitor for PFK-1, slowing down glycolysis when the cell's energy needs are already met."
  }
];

async function insertMCQs() {
  const client = await pool.connect();
  try {
    const chapterId = 126; // Bio-energetics
    const lessonId = 1992; // Respiration Test 2

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

    console.log(`Successfully added ${addedCount} MCQs to Lesson 1992.`);

  } catch (err) {
    console.error('Error inserting MCQs:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

insertMCQs();
