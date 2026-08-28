import { Link } from 'react-router-dom';
import SectionTitle from '../../UI/SectionTitle/SectionTitle';
import { categories } from '../../../data/categories';
import './TopCategories.css';

const TopCategories = () => {
  return (
    <section className="top-categories" id="top-categories" aria-label="Top categories">
      <div className="container">
        <SectionTitle>Top categories</SectionTitle>
        <div className="top-categories__grid">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="top-categories__card"
            >
              <div className="top-categories__image-wrapper">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="top-categories__image"
                  loading="lazy"
                />
                <div className="top-categories__overlay" />
                <h3 className="top-categories__name">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopCategories;
