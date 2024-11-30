import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Log } from './Log';

@Entity()
export class LogLevel {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column()
  declare level: string;

  @OneToMany(() => Log, log => log.logLevel)
  declare logs: Log[];
}
