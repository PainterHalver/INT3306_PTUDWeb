import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Length } from "class-validator";
import { Exclude } from "class-transformer";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Length(3, 255, { message: "Username cần phải có trên 3 ký tự" })
  @Column({ unique: true, nullable: false })
  username: string;

  @Exclude()
  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  account_type: "admin" | "saan_xuat" | "dai_ly" | "bao_hanh";
}
