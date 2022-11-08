import { setSeederFactory } from "typeorm-extension";

import { User } from "../../src/entities/User";

export default setSeederFactory(User, (faker) => {
  const arr = ["admin", "san_xuat", "dai_ly", "bao_hanh"];
  const user = new User();
  user.username = faker.internet.userName();
  user.password = "1111";
  user.account_type = arr[Math.floor(Math.random() * arr.length)] as any;

  return user;
});
