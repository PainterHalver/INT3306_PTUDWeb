import { Product } from "../Product";

export default interface HasAddressAndProducts {
  address: string;
  products: Product[];
}
