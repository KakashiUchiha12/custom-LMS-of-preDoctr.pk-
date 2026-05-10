import { Link } from 'react-router-dom';
import './LectureCard.css';

const LectureCard = ({ title, features, image, link, buttonText = "View Lectures", hasFreePreview = false }) => {
  const isInternal = link.startsWith('/') || link.includes(window.location.host);
  const routePath = link.startsWith('http') ? new URL(link).pathname : link;

  const ImageContent = () => (
    <div className="predoctr-image-wrapper">
      <img src={image} alt={title} className="predoctr-card-image" />
      {hasFreePreview && (
        <div className="free-ribbon">
          <span className="free-ribbon-dot" />
          Free Chapter Inside
        </div>
      )}
    </div>
  );

  return (
    <div className="predoctr-course-card">
      {isInternal ? (
        <Link to={routePath} className="predoctr-image-link">
          <ImageContent />
        </Link>
      ) : (
        <a href={link} className="predoctr-image-link">
          <ImageContent />
        </a>
      )}
      <div className="predoctr-card-body">
        <h3 className="predoctr-subject-title">{title}</h3>
        <ul className="predoctr-features-list">
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
        {isInternal ? (
          <Link to={routePath} className="predoctr-card-btn">{buttonText}</Link>
        ) : (
          <a href={link} className="predoctr-card-btn">{buttonText}</a>
        )}
      </div>
    </div>
  );
};

export default LectureCard;
