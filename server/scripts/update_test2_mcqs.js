const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const mcqs = [
  {
    "id": 69622,
    "question": "What is the percentage of lipids in a bacterial cell?",
    "options": [
      "20%",
      "10%",
      "5%",
      "15%"
    ],
    "correct_answer": "5%",
    "explanation": "Lipids, including membrane phospholipids, constitute ~5% of a bacterial cell’s dry weight, varying by species."
  },
  {
    "id": 69623,
    "question": "Which among the following is the most abundant carbohydrate in nature?",
    "options": [
      "Cellulose",
      "Chitin",
      "Glycogen",
      "Starch"
    ],
    "correct_answer": "Cellulose",
    "explanation": "Cellulose, a structural polysaccharide in plant cell walls, is the most abundant carbohydrate due to plant prevalence."
  },
  {
    "id": 69624,
    "question": "Which of the following is a pure form of cellulose?",
    "options": [
      "Flax",
      "Xylem",
      "Cotton",
      "Wood"
    ],
    "correct_answer": "Cotton",
    "explanation": "Cotton fibers are ~90–95% cellulose, a β-1,4-linked glucose polymer, making it a pure form."
  },
  {
    "id": 69625,
    "question": "Linkage in maltose is?",
    "options": [
      "1,2 Glycosidic linkage",
      "1,3 Glycosidic linkage",
      "1,4 Glycosidic linkage",
      "1,6 Glycosidic linkage"
    ],
    "correct_answer": "1,4 Glycosidic linkage",
    "explanation": "Maltose, a disaccharide of two glucose units, is linked by an α-1,4 glycosidic bond between C1 and C4."
  },
  {
    "id": 69626,
    "question": "The 'Sensual beauty' of nature is due to:",
    "options": [
      "Minerals",
      "Terpenoid",
      "Vitamins",
      "Proteins"
    ],
    "correct_answer": "Terpenoid",
    "explanation": "Terpenoids, like carotenoids and essential oils, provide vibrant colors and fragrances in plants."
  },
  {
    "id": 69627,
    "question": "A form of sugar in which H atom at the asymmetric carbon is projected to the left side and the OH group to the right side is known as:",
    "options": [
      "Levorotatory",
      "D-form",
      "L-form",
      "Dextrorotatory"
    ],
    "correct_answer": "L-form",
    "explanation": "L-form sugars have the hydroxyl group on the right at the chiral carbon farthest from the carbonyl in Fischer projection."
  },
  {
    "id": 69628,
    "question": "Which monosaccharide is a key component of RNA?",
    "options": [
      "Ribose",
      "Deoxyribose",
      "Glucose",
      "Fructose"
    ],
    "correct_answer": "Ribose",
    "explanation": "Ribose, a 5-carbon sugar, forms the sugar-phosphate backbone of RNA nucleotides."
  },
  {
    "id": 69629,
    "question": "Which of the following is a monosaccharide which plays a unique role in the chemistry of life:",
    "options": [
      "Glucose",
      "Galactose",
      "Fructose",
      "Sucrose"
    ],
    "correct_answer": "Glucose",
    "explanation": "Glucose, a 6-carbon monosaccharide, is the primary energy source and metabolic intermediate."
  },
  {
    "id": 69630,
    "question": "Keratin proteins are found in which of the following?",
    "options": [
      "Hairs",
      "Muscles",
      "Egg White",
      "Blood Plasma"
    ],
    "correct_answer": "Hairs",
    "explanation": "Keratin, a fibrous protein, provides structural strength in hair, nails, and skin."
  },
  {
    "id": 69631,
    "question": "What is the total number of tRNA?",
    "options": [
      "One",
      "Ten",
      "Sixty",
      "Twenty"
    ],
    "correct_answer": "Sixty",
    "explanation": "Eukaryotic cells have ~60 tRNA genes, each carrying a specific amino acid for protein synthesis."
  },
  {
    "id": 69632,
    "question": "Palmitic acid is:",
    "options": [
      "Saturated fatty acid",
      "Unsaturated fatty acid",
      "Not fatty acid",
      "Essential fatty acid"
    ],
    "correct_answer": "Saturated fatty acid",
    "explanation": "Palmitic acid (C16:0) is a saturated fatty acid with no double bonds, solid at room temperature."
  },
  {
    "id": 69633,
    "question": "Which of the following group in an amino acid molecule causes its acidic nature?",
    "options": [
      "Carboxyl",
      "Hydroxyl",
      "Carbonyl",
      "Amino"
    ],
    "correct_answer": "Carboxyl",
    "explanation": "The carboxyl group (-COOH) donates a proton, contributing to amino acids’ acidic properties."
  },
  {
    "id": 69634,
    "question": "What percentage of the total RNA in a cell is made up of messenger RNA [mRNA]?",
    "options": [
      "80%",
      "60%",
      "5%",
      "15%"
    ],
    "correct_answer": "5%",
    "explanation": "In eukaryotic cells, mRNA constitutes ~5% of total RNA, with rRNA (~80%) and tRNA (~15%) more abundant."
  },
  {
    "id": 69635,
    "question": "Which of the following is NOT a protein?",
    "options": [
      "Chitin",
      "Silk",
      "Haemoglobin",
      "Collagen"
    ],
    "correct_answer": "Chitin",
    "explanation": "Chitin is a polysaccharide in fungal cell walls, unlike silk, hemoglobin, and collagen."
  },
  {
    "id": 69636,
    "question": "Which of the following scientists determined the amino acid sequence in a protein molecule for the first time?",
    "options": [
      "Robertson",
      "Miescher",
      "Sanger",
      "Watson"
    ],
    "correct_answer": "Sanger",
    "explanation": "Frederick Sanger determined the amino acid sequence of insulin in the 1950s."
  },
  {
    "id": 69637,
    "question": "All of the following are disaccharides except?",
    "options": [
      "Maltose",
      "Galactose",
      "Lactose",
      "Sucrose"
    ],
    "correct_answer": "Galactose",
    "explanation": "Galactose is a monosaccharide, while maltose, lactose, and sucrose are disaccharides."
  },
  {
    "id": 69638,
    "question": "All of the following are made up of isoprenoid units except:",
    "options": [
      "Paper",
      "Rubber",
      "Chlorophyll",
      "Carotenoids"
    ],
    "correct_answer": "Paper",
    "explanation": "Paper is made of cellulose, not isoprenoid units."
  },
  {
    "id": 69639,
    "question": "Which of the following lipids protects the plants from dehydration and damage from scratching?",
    "options": [
      "Phospholipids",
      "Waxes",
      "Acyl glycerol",
      "Steroids"
    ],
    "correct_answer": "Waxes",
    "explanation": "Waxes form a waterproof protective layer on plant surfaces."
  },
  {
    "id": 69640,
    "question": "Which nitrogenous base is found only in DNA?",
    "options": [
      "Uracil",
      "Thymine",
      "Cytosine",
      "Adenine"
    ],
    "correct_answer": "Thymine",
    "explanation": "Thymine is found in DNA, while uracil is found in RNA."
  },
  {
    "id": 69641,
    "question": "Which of the following scientists studied the life cycle of Bacteriophages and proposed that DNA is the hereditary material?",
    "options": [
      "Sanger",
      "Griffith",
      "Hershey and Chase",
      "Avery"
    ],
    "correct_answer": "Hershey and Chase",
    "explanation": "Hershey and Chase proved DNA is the hereditary material using bacteriophages."
  },
  {
    "id": 69642,
    "question": "The bond linkages between the complementary bases of the DNA are made up of:",
    "options": [
      "Hydrogen bonds",
      "Ester bonds",
      "Peptide bonds",
      "Ionic bonds"
    ],
    "correct_answer": "Hydrogen bonds",
    "explanation": "Hydrogen bonds hold complementary nitrogenous bases together."
  },
  {
    "id": 69643,
    "question": "The bond present in the sucrose molecule between the monomers i.e. Glucose and Fructose is called:",
    "options": [
      "Peptide bond",
      "Glycosidic bond",
      "Ester bond",
      "Hydrogen bond"
    ],
    "correct_answer": "Glycosidic bond",
    "explanation": "Sucrose contains a glycosidic bond between glucose and fructose."
  },
  {
    "id": 69644,
    "question": "The type of RNA which functions to transport the genetic information from the DNA to the ribosomes for translation is called:",
    "options": [
      "mRNA",
      "tRNA",
      "rRNA",
      "snRNA"
    ],
    "correct_answer": "mRNA",
    "explanation": "Messenger RNA carries genetic information from DNA to ribosomes."
  },
  {
    "id": 69645,
    "question": "Which of the following conjugated molecules play an important role in the proper functioning of the brain:",
    "options": [
      "Glycoprotein",
      "Lipoprotein",
      "Glycolipids",
      "Nucleoproteins"
    ],
    "correct_answer": "Glycolipids",
    "explanation": "Glycolipids are abundant in nerve tissues and help in brain function."
  },
  {
    "id": 69646,
    "question": "_______________ make up the structure of the organism and are essential for their survival:",
    "options": [
      "Air Molecules",
      "Biological molecules",
      "Metals",
      "Dust particles"
    ],
    "correct_answer": "Biological molecules",
    "explanation": "Biological molecules form the structural and functional basis of life."
  }
];

async function updateMcqs() {
  try {
    const client = await pool.connect();
    console.log('Starting MCQ updates...\n');

    for (const mcq of mcqs) {
      const { id, question, options, correct_answer, explanation } = mcq;
      
      // Map correct_answer to a, b, c, d
      const correctIdx = options.indexOf(correct_answer);
      let correctOpt = '';
      if (correctIdx === 0) correctOpt = 'a';
      else if (correctIdx === 1) correctOpt = 'b';
      else if (correctIdx === 2) correctOpt = 'c';
      else if (correctIdx === 3) correctOpt = 'd';
      
      if (!correctOpt) {
        console.error(`Error: Correct answer "${correct_answer}" not found in options for MCQ ID ${id}`);
        continue;
      }

      const res = await client.query(`
        UPDATE mcqs 
        SET question_text = $1, 
            option_a = $2, 
            option_b = $3, 
            option_c = $4, 
            option_d = $5, 
            correct_opt = $6, 
            explanation = $7
        WHERE id = $8
      `, [question, options[0], options[1], options[2], options[3], correctOpt, explanation, id]);

      if (res.rowCount === 0) {
        console.log(`MCQ ID ${id} not found. Skipped.`);
      } else {
        console.log(`Updated MCQ ID ${id}`);
      }
    }

    client.release();
  } catch (err) {
    console.error('Error updating MCQs:', err);
  } finally {
    await pool.end();
  }
}

updateMcqs();
