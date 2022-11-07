import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Length } from "class-validator";
import { Exclude } from "class-transformer";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Length(3, 255, { message: "Username cần phải có trên 3 ký tự" })
  @Column({ unique: true })
  username: string;

  @Length(3, 255, { message: "Password cần phải có trên 3 ký tự" })
  @Exclude()
  @Column()
  password: string;

  @Column()
  account_type: "admin" | "san_xuat" | "dai_ly" | "bao_hanh";
}
