import SectionTitle from '../../UI/SectionTitle/SectionTitle';
import ProductCard from '../../UI/ProductCard/ProductCard';
import { products } from '../../../data/products';
import './NewestCollection.css';

const NewestCollection = () => {
  return (
    <section className="newest-collection" id="newest-collection" aria-label="Newest collection">
      <div className="container">
        <SectionTitle>Newest Collection</SectionTitle>
        <div className="newest-collection__grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewestCollection;
