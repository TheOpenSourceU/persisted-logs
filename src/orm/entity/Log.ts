import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { LogLevel } from './LogLevel';
import { Tag } from './Tag';
import { App } from "./App";

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  declare id: number;

  @ManyToOne(() => LogLevel, logLevel => logLevel.logs, { cascade: true })
  declare logLevel: LogLevel;

  // This is the many and App is the One.
  @ManyToOne(() => App, app => app.logs, { cascade: true })
  declare app: App;

  @Column({ type: 'text', nullable: false })
  declare message: string;

  @ManyToMany(() => Tag)
  @JoinTable()
  declare tags: Tag[];

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  declare createdOn: Date;
}
