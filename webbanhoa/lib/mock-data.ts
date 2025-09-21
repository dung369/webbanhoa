export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "customer" | "admin";
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  origin: string;
  images: string[];
  inStock: number;
  rating: number;
  reviews: number;
  featured: boolean;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "shipping"
    | "delivered"
    | "cancelled";
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: Date;
  deliveryDate?: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Address {
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
}

// Mock data
export const mockProducts: Product[] = [
  // Products mapped from files in /public/images
  {
    id: 'p-hoa-hong-do-ecuador',
    name: 'Hoa Hồng Đỏ Ecuador',
    description: 'Hoa hồng đỏ cao cấp nhập khẩu từ Ecuador, tươi lâu, màu đỏ thắm.',
    price: 450000,
    originalPrice: 500000,
    category: 'Hoa hồng',
    origin: 'Ecuador',
    images: ['/images/Hoa Hồng Đỏ Ecuador.jpg'],
    inStock: 25,
    rating: 4.8,
    reviews: 12,
    featured: true,
    createdAt: new Date('2024-06-01T12:00:00Z'),
  },
  {
    id: 'p-hoa-baby',
    name: 'Hoa Baby',
    description: 'Hoa Baby trắng tinh khôi, thích hợp để trang trí và kết hợp bó hoa.',
    price: 120000,
    category: 'Hoa baby',
    origin: 'Việt Nam',
    images: ['/images/Hoa Baby.jpg'],
    inStock: 120,
    rating: 4.6,
    reviews: 5,
    featured: false,
    createdAt: new Date('2024-05-15T09:00:00Z'),
  },
  {
    id: 'p-hoa-ly-trang',
    name: 'Hoa Ly Trắng',
    description: 'Hoa ly trắng thơm nồng, thích hợp cho các dịp trang trọng.',
    price: 250000,
    category: 'Hoa ly',
    origin: 'Đà Lạt',
    images: ['/images/Hoa Ly Trắng.jpg'],
    inStock: 40,
    rating: 4.7,
    reviews: 8,
    featured: false,
    createdAt: new Date('2024-04-20T08:30:00Z'),
  },
  {
    id: 'p-hoa-cam-chuong-dalat',
    name: 'Hoa Cẩm Chướng Đà Lạt',
    description: 'Cẩm chướng Đà Lạt tươi đẹp, dùng để cắm hoa bó và trang trí.',
    price: 180000,
    category: 'Hoa cẩm chướng',
    origin: 'Đà Lạt',
    images: ['/images/Hoa Cẩm Chướng Đà Lạt.jpg'],
    inStock: 60,
    rating: 4.5,
    reviews: 4,
    featured: false,
    createdAt: new Date('2024-03-12T10:00:00Z'),
  },
  {
    id: 'p-hoa-cam-tu-cau',
    name: 'Hoa Cẩm Tú Cầu',
    description: 'Cẩm tú cầu rực rỡ, nhiều màu, phù hợp làm quà tặng.',
    price: 320000,
    category: 'Hoa cẩm tú cầu',
    origin: 'Việt Nam',
    images: ['/images/Hoa Cẩm Tú Cầu.jpg'],
    inStock: 18,
    rating: 4.7,
    reviews: 6,
    featured: true,
    createdAt: new Date('2024-02-02T11:00:00Z'),
  },
  {
    id: 'p-hoa-cuc-hoa-mi',
    name: 'Hoa Cúc Họa Mi',
    description: 'Cúc họa mi nhỏ xinh, thích hợp trang trí tiệc và chụp ảnh.',
    price: 90000,
    category: 'Hoa cúc',
    origin: 'Việt Nam',
    images: ['/images/Hoa Cúc Họa Mi.jpg'],
    inStock: 200,
    rating: 4.4,
    reviews: 3,
    featured: false,
    createdAt: new Date('2024-01-20T08:00:00Z'),
  },
  {
    id: 'p-hoa-cuc-van-tho',
    name: 'Hoa Cúc Vạn Thọ',
    description: 'Cúc vạn thọ tươi, màu sắc rực rỡ, dùng nhiều trong trang trí.',
    price: 70000,
    category: 'Hoa cúc',
    origin: 'Việt Nam',
    images: ['/images/Hoa Cúc Vạn Thọ.jpg'],
    inStock: 150,
    rating: 4.3,
    reviews: 2,
    featured: false,
    createdAt: new Date('2024-01-10T08:00:00Z'),
  },
  {
    id: 'p-hoa-huong-duong',
    name: 'Hoa Hướng Dương',
    description: 'Hướng dương tươi, lớn, phù hợp cho bó hoa năng động.',
    price: 220000,
    category: 'Hoa hướng dương',
    origin: 'Việt Nam',
    images: ['/images/Hoa Hướng Dương.jpg'],
    inStock: 34,
    rating: 4.6,
    reviews: 7,
    featured: false,
    createdAt: new Date('2024-03-01T09:00:00Z'),
  },
  {
    id: 'p-hoa-hong-phan',
    name: 'Hoa Hồng Phấn',
    description: 'Hồng phấn nhẹ nhàng, thích hợp cho các dịp lãng mạn.',
    price: 400000,
    category: 'Hoa hồng',
    origin: 'Ecuador',
    images: ['/images/Hoa Hồng Phấn.jpg'],
    inStock: 40,
    rating: 4.6,
    reviews: 9,
    featured: false,
    createdAt: new Date('2024-05-05T09:30:00Z'),
  },
  {
    id: 'p-hoa-lan-ho-diep',
    name: 'Hoa Lan Hồ Điệp',
    description: 'Lan hồ điệp sang trọng, thường dùng cho quà tặng và sự kiện.',
    price: 850000,
    category: 'Hoa lan',
    origin: 'Thái Lan',
    images: ['/images/Hoa Lan Hồ Điệp.jpg'],
    inStock: 12,
    rating: 4.9,
    reviews: 10,
    featured: true,
    createdAt: new Date('2023-12-15T10:00:00Z'),
  },
  {
    id: 'p-hoa-lavender',
    name: 'Hoa Lavender',
    description: 'Lavender thơm dịu, phù hợp để khô và trang trí.',
    price: 180000,
    category: 'Hoa lavender',
    origin: 'Pháp',
    images: ['/images/Hoa Lavender.jpg'],
    inStock: 60,
    rating: 4.5,
    reviews: 4,
    featured: false,
    createdAt: new Date('2024-02-28T07:00:00Z'),
  },
  {
    id: 'p-hoa-sen',
    name: 'Hoa Sen',
    description: 'Hoa sen tinh tế, thường dùng trong nghi lễ và trang trí.',
    price: 300000,
    category: 'Hoa sen',
    origin: 'Việt Nam',
    images: ['/images/Hoa Sen.jpg'],
    inStock: 22,
    rating: 4.4,
    reviews: 3,
    featured: false,
    createdAt: new Date('2024-01-01T06:00:00Z'),
  },
  {
    id: 'p-hoa-tulip-holland',
    name: 'Hoa Tulip Hà Lan',
    description: 'Tulip Hà Lan nhiều màu sắc, biểu tượng mùa xuân.',
    price: 300000,
    category: 'Hoa tulip',
    origin: 'Hà Lan',
    images: ['/images/Hoa Tulip Hà Lan.jpg'],
    inStock: 55,
    rating: 4.6,
    reviews: 11,
    featured: false,
    createdAt: new Date('2024-03-18T09:00:00Z'),
  },
  {
    id: 'p-hoa-violet',
    name: 'Hoa Violet',
    description: 'Hoa violet nhỏ xinh, màu tím mộng mơ.',
    price: 95000,
    category: 'Hoa violet',
    origin: 'Việt Nam',
    images: ['/images/Hoa Violet.jpg'],
    inStock: 80,
    rating: 4.3,
    reviews: 2,
    featured: false,
    createdAt: new Date('2024-02-10T08:00:00Z'),
  },
  {
    id: 'p-hoa-dong-tien',
    name: 'Hoa Đồng Tiền',
    description: 'Hoa đồng tiền nhiều sắc, thường dùng cho bó hoa tươi.',
    price: 140000,
    category: 'Hoa đồng tiền',
    origin: 'Việt Nam',
    images: ['/images/Hoa Đồng Tiền.jpg'],
    inStock: 90,
    rating: 4.2,
    reviews: 1,
    featured: false,
    createdAt: new Date('2024-02-22T08:00:00Z'),
  },
  {
    id: 'p-hoa-do-quyen',
    name: 'Hoa Đỗ Quyên',
    description: 'Hoa đỗ quyên rực rỡ, thường trồng làm cảnh.',
    price: 160000,
    category: 'Hoa đỗ quyên',
    origin: 'Việt Nam',
    images: ['/images/Hoa Đỗ Quyên.jpg'],
    inStock: 30,
    rating: 4.4,
    reviews: 2,
    featured: false,
    createdAt: new Date('2024-03-05T08:00:00Z'),
  },
  // 'Ảnh cửa hàng' (store photo) intentionally removed from mockProducts
];

// Mock users removed — fall back to Firestore users collection when available.
export const mockUsers: User[] = [];

// Mock orders removed — rely on Firestore for real orders. Keep empty array shape for safety.
export const mockOrders: Order[] = [];
