import { Link } from 'react-router-dom';
import './LectureCard.css';

const LectureCard = ({ title, features, image, link, buttonText = "View Lectures" }) => {
  // Determine if link is internal or external
  const isInternal = link.startsWith('/') || link.includes(window.location.host);
  const routePath = link.startsWith('http') ? new URL(link).pathname : link;

  return (
    <div className="predoctr-course-card">
      {isInternal ? (
        <Link to={routePath} className="predoctr-image-link">
          <img src={image} alt={title} className="predoctr-card-image" />
        </Link>
      ) : (
        <a href={link} className="predoctr-image-link">
          <img src={image} alt={title} className="predoctr-card-image" />
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
