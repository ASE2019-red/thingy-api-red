import { Length } from 'class-validator';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Coffee } from './coffee';

@Entity()
export class Machine {

    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column('text')
    public name: string;

    @Column('text')
    @Length(17, 17)
    // bluetooth id of the sensor e.g.
    // d1:d9:9f:36:cf:93
    public sensorIdentifier: string;

    @Column('boolean')
    public active: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    public createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    public updatedAt: Date;

    @OneToMany((type) => Coffee, (coffee) => coffee.machine)
    public coffees: Coffee[];

    @Column('integer', {nullable: true})
    public maintenanceThreshold?: number;
}
