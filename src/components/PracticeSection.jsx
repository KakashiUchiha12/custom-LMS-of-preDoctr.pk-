import React from 'react';
import LectureCard from './LectureCard';
import './Section.css';

const PracticeSection = () => {
  const practiceTests = [
    {
      title: 'Biology MCQs',
      features: ['Notes', 'Short Listings', '6 Conceptual Tests', 'KMU/ETEA Past Papers', 'Board Book Based MCQs'],
      image: '/Biology-MCQs.png',
      link: '/courses/biology-mcqs',
      hasFreePreview: true
    },
    {
      title: 'Chemistry MCQs',
      features: ['Notes', 'Short Listings', '6 Conceptual Tests', 'KMU/ETEA Past Papers', 'Board Book Based MCQs'],
      image: '/Chemistry-MCQs-1024x576-1.png',
      link: '/courses/chemistry-mcqs'
    },
    {
      title: 'Physics MCQs',
      features: ['Notes', 'Short Listings', '6 Conceptual Tests', 'KMU/ETEA Past Papers', 'Board Book Based MCQs'],
      image: '/Physics-mcqS.png',
      link: '/courses/physics'
    },
    {
      title: 'English MCQs',
      features: ['Notes', 'Short Listings', '6 Conceptual Tests', 'KMU/ETEA Past Papers', 'Board Book Based MCQs'],
      image: '/English-MCQs.png',
      link: '/courses/english-mcqs'
    },
    {
      title: 'Logical Reasoning MCQs',
      features: ['Notes', 'Short Listings', '6 Conceptual Tests', 'KMU/ETEA Past Papers', 'Board Book Based MCQs'],
      image: '/Logical-Reasoning-MCQs.png',
      link: '/courses/logical-reasoning-mcqs'
    },
    {
      title: 'preDoctr.pk Test Series',
      features: ['13 Tests', 'PMDC Syllabus', 'Full Syllabus Coverage', '3 Full Length 180 MCQs Tests'],
      image: '/preDoctr.pk-Test-Series.png',
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
      image: '/Full-Length-Past-Papers.png',
      link: '/courses/past-papers-full-length/'
    },
    {
      title: 'Full Length Test Series by Risen Academy',
      features: [
        '10 Tests',
        '200 MCQs Test',
        '2024 PMDC Syllabus'
      ],
      image: '/Full-Length-Test-Series-by-Risen-Academy.png',
      link: '/courses/full-length-test-series/'
    }
  ];

  return (
    <div className="predoctr-courses-container" style={{ paddingTop: 0 }}>
      <h2 className="predoctr-section-title">Test your Concepts with <span> Practice Tests </span></h2>
      <div className="predoctr-courses-grid">
        {practiceTests.map((test, index) => (
          <LectureCard key={index} {...test} hasFreePreview={test.hasFreePreview} buttonText="View Course" />
        ))}
      </div>
    </div>
  );
};

export default PracticeSection;
