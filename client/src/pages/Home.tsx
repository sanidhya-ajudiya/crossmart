import Hero from "../components/Home/Hero"
import Features from "../components/Home/Features"
import HomeCategories from "../components/Home/HomeCategories"
import PopularProducts from "../components/Home/PopularProducts"
import AppPromoBanner from "../components/Home/AppPromoBanner"
import NewsLetter from "../components/Home/NewsLetter"

const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <HomeCategories />
      <PopularProducts />
      <AppPromoBanner />
      <NewsLetter />
    </div>
  )
}

export default Home
