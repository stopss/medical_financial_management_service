'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Management extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Management.init({
    title: DataTypes.STRING,
    file: DataTypes.STRING,
    write: DataTypes.STRING,
    userId: DataTypes.STRING,
    user: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Management',
  });
  return Management;
};