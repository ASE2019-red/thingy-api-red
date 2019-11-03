import {
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Machine } from './machine';

@Entity()
export class Coffee {

    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @ManyToOne((type) => Machine, (machine) => machine.coffees)
    public machine: Machine;
}
