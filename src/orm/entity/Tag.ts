import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column({ type: 'varchar', length: 999, nullable: false })
  declare tag: string;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  declare createdOn: Date;
}
