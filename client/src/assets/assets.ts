export const dummyAdminDashboardData = {
  totalOrders: 142,
  totalUsers: 89,
  totalProducts: 48,
  outOfStock: 3,
  recentOrders: [
    {
      _id: "ord_1a2b3c4d5e6f",
      user: { name: "Aarav Mehta", email: "aarav@example.com" },
      items: [
        { productId: "p1", quantity: 2 },
        { productId: "p2", quantity: 1 }
      ],
      total: 395.00,
      status: "Placed",
      createdAt: new Date().toISOString()
    },
    {
      _id: "ord_7g8h9i0j1k2l",
      user: { name: "Ishaan Sharma", email: "ishaan@example.com" },
      items: [
        { productId: "p3", quantity: 1 }
      ],
      total: 110.00,
      status: "Processing",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      _id: "ord_3m4n5o6p7q8r",
      user: { name: "Ananya Iyer", email: "ananya@example.com" },
      items: [
        { productId: "p4", quantity: 3 },
        { productId: "p5", quantity: 2 }
      ],
      total: 780.00,
      status: "Shipped",
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      _id: "ord_9s0t1u2v3w4x",
      user: { name: "Diya Rao", email: "diya@example.com" },
      items: [
        { productId: "p6", quantity: 2 }
      ],
      total: 220.00,
      status: "Delivered",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      _id: "ord_5y6z7a8b9c0d",
      user: { name: "Kabir Verma", email: "kabir@example.com" },
      items: [
        { productId: "p7", quantity: 1 }
      ],
      total: 160.00,
      status: "Cancelled",
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ]
};

export const statusColors: Record<string, string> = {
  Placed: "status-placed",
  Processing: "status-processing",
  Shipped: "status-shipped",
  Delivered: "status-delivered",
  Cancelled: "status-cancelled"
};

export const dummyDeliveryPartnerData = [
  {
    _id: "dlv_part_1",
    name: "Rajesh Kumar",
    email: "rajesh@crossmart.com",
    phone: "+91 98765 12345",
    vehicleType: "bike",
    isActive: true
  },
  {
    _id: "dlv_part_2",
    name: "Amit Patel",
    email: "amit@crossmart.com",
    phone: "+91 98765 67890",
    vehicleType: "scooter",
    isActive: true
  },
  {
    _id: "dlv_part_3",
    name: "Suresh Pillai",
    email: "suresh@crossmart.com",
    phone: "+91 91234 56789",
    vehicleType: "car",
    isActive: false
  }
];

export const dummyDashboardOrdersData = [
  {
    _id: "ord_1001",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    user: { name: "Rohan Gupta", email: "rohan@example.com" },
    total: 350.00,
    deliveryPartner: { name: "Rajesh Kumar", phone: "+91 98765 12345" },
    status: "Confirmed"
  },
  {
    _id: "ord_1002",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    user: { name: "Meera Sen", email: "meera@example.com" },
    total: 1250.00,
    deliveryPartner: null,
    status: "Placed"
  },
  {
    _id: "ord_1003",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    user: { name: "Vikram Malhotra", email: "vikram@example.com" },
    total: 450.00,
    deliveryPartner: { name: "Amit Patel", phone: "+91 98765 67890" },
    status: "Delivered"
  },
  {
    _id: "ord_1004",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    user: { name: "Sneha Reddy", email: "sneha@example.com" },
    total: 80.00,
    deliveryPartner: null,
    status: "Cancelled"
  }
];

export const categoriesData = [
  { slug: "fruits-vegetables", name: "Fruits & Veggies" },
  { slug: "dairy-eggs", name: "Dairy & Eggs" },
  { slug: "bakery", name: "Bakery" },
  { slug: "pantry", name: "Pantry" }
];

export const dummyProducts = [
  {
    _id: "prod-1",
    name: "Organic Fresh Bananas",
    description: "Rich in potassium and vitamins, fresh from organic farms.",
    price: 60,
    originalPrice: 70,
    image: "https://images.unsplash.com/photo-1566393028639-d108a42c46a7?w=400&auto=format&fit=crop&q=60",
    category: "fruits-vegetables",
    unit: "doz",
    stock: 120,
    isOrganic: true
  },
  {
    _id: "prod-2",
    name: "Sweet Red Strawberries",
    description: "Juicy, sweet, and freshly plucked red strawberries.",
    price: 120,
    originalPrice: 150,
    image: "https://images.unsplash.com/photo-1594747186943-4f1d75830a87?w=400&auto=format&fit=crop&q=60",
    category: "fruits-vegetables",
    unit: "box",
    stock: 85,
    isOrganic: true
  },
  {
    _id: "prod-3",
    name: "Pure Wildflower Honey",
    description: "100% natural, unfiltered wildflower honey.",
    price: 280,
    originalPrice: 320,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=60",
    category: "pantry",
    unit: "jar",
    stock: 50,
    isOrganic: true
  }
];



