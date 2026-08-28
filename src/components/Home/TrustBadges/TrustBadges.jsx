import { TruckIcon, ReturnIcon, SupportIcon } from '../../../assets/icons';
import './TrustBadges.css';

const badges = [
  {
    id: 'shipping',
    icon: <TruckIcon size={40} />,
    label: 'FREE SHIPPING',
  },
  {
    id: 'returns',
    icon: <ReturnIcon size={40} />,
    label: 'EASY RETURNS',
  },
  {
    id: 'support',
    icon: <SupportIcon size={40} />,
    label: '24/7 SUPPORT',
  },
];

const TrustBadges = () => {
  return (
    <section className="trust-badges" id="trust-badges" aria-label="Trust badges">
      <div className="container">
        <div className="trust-badges__grid">
          {badges.map((badge) => (
            <div key={badge.id} className="trust-badges__item">
              <span className="trust-badges__icon">{badge.icon}</span>
              <span className="trust-badges__label">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
