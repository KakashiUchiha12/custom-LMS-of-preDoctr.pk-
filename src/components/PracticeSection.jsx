import React from 'react';
import LectureCard from './LectureCard';
import bioImg from '../assets/biology.png';
import chemImg from '../assets/chemistry.png';
import physImg from '../assets/physics.png';
import engImg from '../assets/english.png';
import logicImg from '../assets/logic.png';
import pastImg from '../assets/past_papers.png';
import risenImg from '../assets/risen_academy.png';
import logoImg from '../assets/logo.png';
import './Section.css';

const PracticeSection = () => {
  const practiceTests = [
    {
      title: 'Biology MCQs',
      features: ['Notes', 'Short Listings', '6 Conceptual Tests', 'KMU/ETEA Past Papers', 'Board Book Based MCQs'],
      image: bioImg,
      link: '/courses/biology-mcqs'
    },
    {
      title: 'Chemistry MCQs',
      features: ['Notes', 'Short Listings', '6 Conceptual Tests', 'KMU/ETEA Past Papers', 'Board Book Based MCQs'],
      image: chemImg,
      link: '/courses/chemistry-mcqs'
    },
    {
      title: 'Physics MCQs',
      features: ['Notes', 'Short Listings', '6 Conceptual Tests', 'KMU/ETEA Past Papers', 'Board Book Based MCQs'],
      image: physImg,
      link: '/courses/physics'
    },
    {
      title: 'English MCQs',
      features: ['Notes', 'Short Listings', '6 Conceptual Tests', 'KMU/ETEA Past Papers', 'Board Book Based MCQs'],
      image: engImg,
      link: '/courses/english-mcqs'
    },
    {
      title: 'Logical Reasoning MCQs',
      features: ['Notes', 'Short Listings', '6 Conceptual Tests', 'KMU/ETEA Past Papers', 'Board Book Based MCQs'],
      image: logicImg,
      link: '/courses/logical-reasoning-mcqs'
    },
    {
      title: 'preDoctr.pk Test Series',
      features: ['13 Tests', 'PMDC Syllabus', 'Full Syllabus Coverage', '3 Full Length 180 MCQs Tests'],
      image: logoImg,
      link: '/courses/predoctr-test-series/'
    },
    {
      title: 'Full Length Past Papers',
      features: [
        'UHS Past Papers',
        'KMU Past Papers',
        'SZABMU Past Papers',
        'Balochistan Past Papers',
        'Sindh MDCAT Past Papers',
        'NUMS Past Papers'
      ],
      image: pastImg,
      link: '/courses/past-papers-full-length/'
    },
    {
      title: 'Full Length Test Series by Risen Academy',
      features: [
        '10 Tests',
        '200 MCQs Test',
        '2024 PMDC Syllabus'
      ],
      image: risenImg,
      link: '/courses/full-length-test-series/'
    }
  ];

  return (
    <div className="predoctr-courses-container" style={{ paddingTop: 0 }}>
      <h2 className="predoctr-section-title">Test your Concepts with <span> Practice Tests </span></h2>
      <div className="predoctr-courses-grid">
        {practiceTests.map((test, index) => (
          <LectureCard key={index} {...test} buttonText="View Course" />
        ))}
      </div>
    </div>
  );
};

export default PracticeSection;
