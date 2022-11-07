import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsPhoneNumber } from "class-validator";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @IsPhoneNumber("VN", { message: "Số điện thoại không hợp lệ" })
  @Column({ unique: true, nullable: false })
  phone: string;

  @Column()
  address: string;
}
