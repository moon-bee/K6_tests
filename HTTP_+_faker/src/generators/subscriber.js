var faker = require('faker/locale/en_US');

export const generateSubscriber = () => ({
    name: faker.name.firstName(),
    //email: faker.internet.email(),
    email: "errrrror@ffo.ccom",
    password: faker.internet.password(10),

});
