import React from 'react';
import LectureCard from './LectureCard';
import './Section.css';

const LectureSection = () => {
  const lectures = [
    {
      title: 'Biology Lectures',
      features: ['Full PMDC Syllabus', 'Prerecorded Lecture', 'Questions/Answers'],
      image: '/BIOLOGY-LECTURES.png',
      link: '/courses/biology-lectures',
      hasFreePreview: true
    },
    {
      title: 'Chemistry Lectures',
      features: ['Full PMDC Syllabus', 'Prerecorded Lecture', 'Questions/Answers'],
      image: '/CHEMISTRY-LECTURES.png',
      link: '/courses/chemistry-lectures'
    },
    {
      title: 'Physics Lectures',
      features: ['Full PMDC Syllabus', 'Prerecorded Lecture', 'Questions/Answers'],
      image: '/PHYSICS-LECTURES.png',
      link: '/courses/physics-lectures'
    },
    {
      title: 'English Lectures',
      features: ['Full PMDC Syllabus', 'Prerecorded Lecture', 'Questions/Answers'],
      image: '/ENGLISH-LECTURES.png',
      link: '/courses/english-lectures'
    },
    {
      title: 'Logical Reasoning',
      features: ['Full PMDC Syllabus', 'Prerecorded Lecture', 'Questions/Answers'],
      image: '/LOGICAL-REASONING-LECTURES.png',
      link: '/courses/logical-reasoning-lectures'
    }
  ];

  return (
    <div className="predoctr-courses-container" style={{ paddingTop: 0 }}>
      <div className="predoctr-courses-grid">
        {lectures.map((lecture, index) => (
          <LectureCard key={index} {...lecture} hasFreePreview={lecture.hasFreePreview} />
        ))}
      </div>
    </div>
  );
};

export default LectureSection;
