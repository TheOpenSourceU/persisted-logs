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

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  declare id: number;

  //@OneToOne(() => LogLevel)
  @ManyToOne(() => LogLevel, logLevel => logLevel.logs, { cascade: true })
  declare logLevel: LogLevel;

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
