import React from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, Calculator, FileCheck, Map } from 'lucide-react';
import './ResourcePage.css';

const ResourcePage = () => {
  const { resourceId } = useParams();
  
  const getResourceDetails = (id) => {
    switch(id) {
      case 'board-books':
        return { title: 'Board Books', icon: <BookOpen size={40} />, desc: 'Access all provincial board books for MDCAT preparation.' };
      case 'mdcat-syllabus-2021-onwards':
        return { title: 'MDCAT Syllabus', icon: <Map size={40} />, desc: 'Official PMDC MDCAT Syllabus and guidelines.' };
      case 'aggregate-calculator':
        return { title: 'Aggregate Calculator', icon: <Calculator size={40} />, desc: 'Calculate your MDCAT aggregate based on latest formulas.' };
      case 'ocr-answer-sheet':
        return { title: 'Blank OCR Answer Sheet', icon: <FileCheck size={40} />, desc: 'Download and print OCR sheets for realistic practice.' };
      default:
        return { title: 'Resource', icon: <BookOpen size={40} />, desc: 'Educational resource for pre-medical students.' };
    }
  };

  const details = getResourceDetails(resourceId);

  return (
    <div className="resource-page">
      <div className="container">
        <div className="resource-card-full">
          <div className="resource-header-info">
            <div className="resource-icon-circle">{details.icon}</div>
            <h1>{details.title}</h1>
            <p>{details.desc}</p>
          </div>
          
          <div className="resource-content-placeholder">
            <div className="placeholder-box">
              <h3>Content Coming Soon</h3>
              <p>We are currently uploading the latest {details.title} materials. Check back shortly!</p>
              <button className="primary-btn">Notify Me</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcePage;
