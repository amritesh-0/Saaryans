import './SectionTitle.css';

const SectionTitle = ({ children, subtitle, className = '' }) => {
  return (
    <div className={`section-title ${className}`}>
      <h2 className="section-title__heading">{children}</h2>
      {subtitle && <p className="section-title__subtitle">{subtitle}</p>}
    </div>
  );
};

export default SectionTitle;
