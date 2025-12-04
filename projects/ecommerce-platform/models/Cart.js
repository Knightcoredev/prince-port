// Stub Cart model for demo purposes
class Cart {
  constructor(data) {
    this.userId = data.userId;
    this.items = data.items || [];
  }

  static async findOne() {
    return null;
  }

  async save() {
    return this;
  }

  async populate() {
    return this;
  }

  toObject() {
    return {
      userId: this.userId,
      items: this.items
    };
  }
}

export default Cart;
