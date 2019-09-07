module.exports = {
    dialect: 'postgres',
    host: '172.17.0.2',
    username: 'postgres',
    password: 'postgres',
    database: 'postgres',
    define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true,
    },
}