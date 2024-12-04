import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Log } from './Log';

@Entity()
export class App {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column()
  declare name: string;

  // I see. This is the one; Log is the many.
  @OneToMany(() => Log, log => log.app)
  declare logs: Log[];

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  declare createdOn: Date;
}
