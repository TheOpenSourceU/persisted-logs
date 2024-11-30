import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class App {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column()
  declare name: string;
}