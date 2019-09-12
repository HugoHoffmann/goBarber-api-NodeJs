import Sequelize from 'sequelize';
import mongoose from 'mongoose'
import DataBaseConfig from '../config/database';
import User from '../app/models/User';
import File from '../app/models/File';
import Appointments from '../app/models/Appointments';
const models = [User, File, Appointments];

class DataBase{
    constructor(){
        this.init();
        this.mongo();
    }
    init(){
        this.connection = new Sequelize(DataBaseConfig);
        models.map(model => model.init(this.connection));
        models.map(model => model.associate && model.associate(this.connection.models));
    }
    mongo(){
        this.mongoConnection = mongoose.connect(
            process.env.MONGO_URL,{
                useNewUrlParser: true,
                useFindAndModify: true
            }
        );
    }
}

export default new DataBase();