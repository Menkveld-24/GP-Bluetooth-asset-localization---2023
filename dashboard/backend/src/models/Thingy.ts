import {
    type CreationOptional,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    Model,
    type Sequelize
} from 'sequelize';

export default class Thingy extends Model<
InferAttributes<Thingy>,
InferCreationAttributes<Thingy>
> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: string;
    declare mac: string;
    declare image: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

export function initThingy (sequelize: Sequelize): void {
    Thingy.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false
            },
            mac: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            image: {
                type: DataTypes.STRING,
                allowNull: false
            },
            createdAt: {
                type: DataTypes.DATE
            },
            updatedAt: {
                type: DataTypes.DATE
            }
        },
        {
            sequelize,
            timestamps: true
        }
    );
}
