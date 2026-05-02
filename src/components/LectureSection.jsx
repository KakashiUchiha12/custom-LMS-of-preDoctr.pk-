import React from 'react';
import LectureCard from './LectureCard';
import bioImg from '../assets/biology.png';
import chemImg from '../assets/chemistry.png';
import physImg from '../assets/physics.png';
import engImg from '../assets/english.png';
import logicImg from '../assets/logic.png';
import './Section.css';

const LectureSection = () => {
  const lectures = [
    {
      title: 'Biology Lectures',
      features: ['Full PMDC Syllabus', 'Prerecorded Lecture', 'Questions/Answers'],
      image: bioImg,
      link: '/courses/biology-lectures'
    },
    {
      title: 'Chemistry Lectures',
      features: ['Full PMDC Syllabus', 'Prerecorded Lecture', 'Questions/Answers'],
      image: chemImg,
      link: '/courses/chemistry-lectures'
    },
    {
      title: 'Physics Lectures',
      features: ['Full PMDC Syllabus', 'Prerecorded Lecture', 'Questions/Answers'],
      image: physImg,
      link: '/courses/physics-lectures'
    },
    {
      title: 'English Lectures',
      features: ['Full PMDC Syllabus', 'Prerecorded Lecture', 'Questions/Answers'],
      image: engImg,
      link: '/courses/english-lectures'
    },
    {
      title: 'Logical Reasoning',
      features: ['Full PMDC Syllabus', 'Prerecorded Lecture', 'Questions/Answers'],
      image: logicImg,
      link: '/courses/logical-reasoning-lectures'
    }
  ];

  return (
    <div className="predoctr-courses-container" style={{ paddingTop: 0 }}>
      <div className="predoctr-courses-grid">
        {lectures.map((lecture, index) => (
          <LectureCard key={index} {...lecture} />
        ))}
      </div>
    </div>
  );
};

export default LectureSection;
