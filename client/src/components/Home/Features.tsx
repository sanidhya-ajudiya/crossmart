import { Clock, Leaf, ShieldCheck, Truck } from "lucide-react"

const Features = () => {
  const featuresList = [
    {
      icon: <Truck size={24} className="feature-icon" />,
      title: "Free Delivery",
      description: "Orders over ₹20"
    },
    {
      icon: <Leaf size={24} className="feature-icon" />,
      title: "100% Organic",
      description: "Certified products"
    },
    {
      icon: <Clock size={24} className="feature-icon" />,
      title: "Same Day",
      description: "Express delivery"
    },
    {
      icon: <ShieldCheck size={24} className="feature-icon" />,
      title: "Secure Pay",
      description: "Safe checkout"
    }
  ]

  return (
    <section className="features-container">
      <div className="features-grid">
        {featuresList.map((item, index) => (
          <div key={index} className="feature-item">
            <div className="feature-icon-wrapper">
              {item.icon}
            </div>
            <div className="feature-text">
              <h3 className="feature-title">{item.title}</h3>
              <p className="feature-desc">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Features