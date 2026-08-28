import Button from '../../UI/Button/Button';
import newArrivalsBanner from '../../../assets/images/new-arrivals-banner.jpg';
import './NewArrivals.css';

const NewArrivals = () => {
  return (
    <section className="new-arrivals" id="new-arrivals" aria-label="New arrivals">
      <div className="container">
        <div className="new-arrivals__banner">
          <div className="new-arrivals__content">
            <div className="new-arrivals__arch">
              <div className="new-arrivals__text">
                <h2 className="new-arrivals__title">
                  NEW<br />ARRIVALS
                </h2>
                <div className="new-arrivals__divider">
                  <span className="new-arrivals__line" />
                  <span className="new-arrivals__upto">UP TO</span>
                  <span className="new-arrivals__line" />
                </div>
                <p className="new-arrivals__discount">
                  <span className="new-arrivals__percent">50%</span>
                  <span className="new-arrivals__off">OFF</span>
                </p>
                <Button variant="primary" size="md">BUY NOW</Button>
              </div>
            </div>
          </div>
          <div className="new-arrivals__image-wrapper">
            <img
              src={newArrivalsBanner}
              alt="New arrivals collection"
              className="new-arrivals__image"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
