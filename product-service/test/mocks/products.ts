interface Product {
  id: string,
  title: string,
  description: string,
  price: number,
};

export const products: Product[] = [
  {
    description: "Short Product Description1",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    price: 24,
    title: "ProductOne",
  },
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80ab",
    description: "A delicious milk chocolate bar",
    price: 19.99,
    title: "Dairy Milk"
  },
  {
    description: "A smooth and creamy chocolate bar",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
    price: 2,
    title: "Milkybar",
  },
  {
    description: "A rich and indulgent dark chocolate bar",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
    price: 2.99,
    title: "Lindt Excellence",
  },
  {
    description: "A chocolate bar filled with hazelnut cream",
    id: "7567ec4b-b10c-48c5-9345-fc73348a80a1",
    price: 1.29,
    title: "Snickers",
  },
  {
    description: "A chocolate bar with a crispy wafer and hazelnut filling",
    id: "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
    price: 23,
    title: "KitKat",
  },
  {
    description: "A chocolate bar with a coconut filling",
    id: "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
    price: 15,
    title: "Bounty",
  },
];
