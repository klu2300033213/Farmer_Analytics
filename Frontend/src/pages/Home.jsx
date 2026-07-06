import Hero from "../components/Hero";

function Home({ onExploreAnalytics }) {
  return (
    <div className="home-container">
      <Hero onExploreAnalytics={onExploreAnalytics} />
    </div>
  );
}

export default Home;
