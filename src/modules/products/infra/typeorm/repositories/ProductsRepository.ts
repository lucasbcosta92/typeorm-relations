import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });
    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ where: { name } });
    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const product = await this.ormRepository.findByIds(products);
    return product;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    // mapeando os produtos
    const product = await this.findAllById(
      products.map(prod => ({ id: prod.id })),
    );

    // mapenado o produto desejado, copiando-o e e alteradando a quantidade do mesmo
    const updateProduct = product.map(prod => ({
      ...prod,
      quantity:
        prod.quantity -
        (products.find(({ id }) => id === prod.id)?.quantity || 0),
    }));

    // salvando as alterações
    await this.ormRepository.save(updateProduct);

    return updateProduct;
  }
}

export default ProductsRepository;
