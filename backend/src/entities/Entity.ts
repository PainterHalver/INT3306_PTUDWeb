import { Exclude, instanceToPlain } from "class-transformer";
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export default abstract class Entity {
  @PrimaryGeneratedColumn()
  id: number;

  //   @Exclude()
  //   @CreateDateColumn()
  //   createdAt: Date;

  //   @Exclude()
  //   @UpdateDateColumn()
  //   updatedAt: Date;

  // Method này cần để chạy được class-transformer
  toJSON() {
    return instanceToPlain(this);
  }
}
