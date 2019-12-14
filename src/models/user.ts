import { IsEmail, Length } from 'class-validator';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column('text')
    public name: string;

    @Column('text')
    @Length(5, 100)
    @IsEmail()
    public email: string;

    @Column('text')
    public hashedPassword: string;

    @Column('boolean')
    public active: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    public createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    public updatedAt: Date;
}
