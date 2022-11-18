
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tags')
class TagEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  name: string;


}

export default TagEntity;