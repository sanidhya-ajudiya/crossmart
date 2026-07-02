import { TruckIcon, XIcon, ZapIcon } from "lucide-react";
import { useState } from "react"

const Banner = () => {
   
  const [bannerVisible, setBannerVisible] = useState(() => {
    return sessionStorage.getItem('banner_dismissed') !== "true";
  })

  const dismissBanner = () => {
    setBannerVisible(false)
    sessionStorage.setItem("banner_dismissed", "true")
  }

  return (
    <div>
      {bannerVisible && (
        <div className="banner-container">
          <div className="banner-content">
             <div className="banner-text">
               <TruckIcon className="banner-icon" />
               <span>Free delivery on orders above ₹100</span>
             </div>
             <span></span>
             <div className="banner-style">
               <ZapIcon className="banner-icon" />
               <span>Farm-fresh product delivered daily</span> 
             </div> 
          </div>
          <button onClick={dismissBanner} className="banner-close">
            <XIcon />
          </button> 
        </div>
      )}  
    </div>
  )
}

export default Banner