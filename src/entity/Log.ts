import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { LogLevel } from "./LogLevel";
import { Tag } from "./Tag";

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  declare id: number;

  @OneToOne(() => LogLevel, { nullable: false })
  @JoinColumn()
  declare logLevel: LogLevel;

  @Column({ type: "text", nullable: false })
  declare message: string;

  @ManyToMany(() => Tag)
  @JoinTable()
  declare tags: Tag[];

  @Column({
    type: "timestamp",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
  })
  declare createdOn: Date;
}
