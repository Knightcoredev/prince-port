// Stub Product model for demo purposes
class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.price = data.price;
    this.inventory = data.inventory || 100;
  }

  static async findById(id) {
    return new Product({
      id,
      name: 'Sample Product',
      price: 29.99,
      inventory: 100
    });
  }
}

export default Product;
