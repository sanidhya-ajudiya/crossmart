import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import catFruitsVeg from "../../assets/categroies/cat_fruits_veg.png"
import catDairyEggs from "../../assets/categroies/cat_dairy_eggs.png"
import catBakery from "../../assets/categroies/cat_bakery.png"
import catPantry from "../../assets/categroies/cat_pantry.png"

const HomeCategories = () => {
  const categories = [
    {
      name: "Fruits & Vegetables",
      count: "120+ Items",
      image: catFruitsVeg,
      link: "/products?category=fruits-vegetables"
    },
    {
      name: "Dairy & Eggs",
      count: "48+ Items",
      image: catDairyEggs,
      link: "/products?category=dairy-eggs"
    },
    {
      name: "Artisan Bakery",
      count: "36+ Items",
      image: catBakery,
      link: "/products?category=bakery"
    },
    {
      name: "Organic Pantry",
      count: "84+ Items",
      image: catPantry,
      link: "/products?category=pantry"
    }
  ]

  return (
    <section className="home-categories">
      <div className="categories-header">
        <div>
          <h2 className="section-title">Browse Categories</h2>
          <p className="section-desc">Find exactly what you need from our handpicked organic selections.</p>  
        </div>
      </div>

      <div className="categories-grid">
        {categories.map((cat, idx) => (
          <Link to={cat.link} key={idx} className="category-card">
            <div className="category-image-wrapper">
              <img src={cat.image} alt={cat.name} className="category-image" />
            </div>
            <div className="category-card-overlay" />
            <div className="category-info">
              <span className="category-item-count">{cat.count}</span>
              <h3 className="category-name">{cat.name}</h3>
              <div className="category-action">
                <span>Explore</span>
                <div className="action-circle">
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default HomeCategories