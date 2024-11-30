import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Log } from "./Log";

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column({ type: "varchar", length: 999, nullable: false })
  declare tag: string;

  // @ManyToMany(() => Log, log => log.tags)
  // @JoinTable()
  // declare logs: Log[];
}
