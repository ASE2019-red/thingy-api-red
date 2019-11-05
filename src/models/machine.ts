import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Length, IsEmail } from 'class-validator';
import { Coffee } from './coffee';

@Entity()
export class Machine {

    @PrimaryGeneratedColumn('uuid')
    id: string;


    @Column('text')
    name: string;

    @Column('text')
    @Length(17, 17)
    // bluetooth id of the sensor e.g.
    // d1:d9:9f:36:cf:93
    sensorIdentifier: string;

    @Column('boolean')
    active: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(type => Coffee, coffee => coffee.machine)
    coffees: Coffee;
}
