import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Log } from "./Log";

@Entity()
export class App {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column()
  declare name: string;

  @Column()
  declare logs: Log[];
}
