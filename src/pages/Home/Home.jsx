import HeroSlider from '../../components/Home/HeroSlider/HeroSlider';
import TrustBadges from '../../components/Home/TrustBadges/TrustBadges';
import TopCategories from '../../components/Home/TopCategories/TopCategories';
import NewArrivals from '../../components/Home/NewArrivals/NewArrivals';
import NewestCollection from '../../components/Home/NewestCollection/NewestCollection';
import Newsletter from '../../components/Home/Newsletter/Newsletter';
import './Home.css';

const Home = () => {
  return (
    <main className="home" id="home-page">
      <HeroSlider />
      <TrustBadges />
      <TopCategories />
      <NewArrivals />
      <NewestCollection />
      <Newsletter />
    </main>
  );
};

export default Home;
