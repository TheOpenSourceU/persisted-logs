import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class LogLevel {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column()
  declare level: string;
}
