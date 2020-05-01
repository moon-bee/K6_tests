import http from 'k6/http';
import {check, group, sleep, fail} from 'k6';

// Еще разобраться с метриками
export let options = {
    stages: [
        { target: 20, duration: '60s' },
    ],
    thresholds: {
        'http_req_duration': ['p(95)<500', 'p(99)<1500'],
        'http_req_duration{name:PublicCrocs}': ['avg<400'],
        'http_req_duration{name:Create}': ['avg<600', 'max<1000'],
    },
};

// Рандом для параметров
function randomString(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyz';
    let res = '';
    while (length--) res += charset[Math.random() * charset.length | 0];
    return res;
}

// Инициализация параметров
const USERNAME = `${randomString(10)}`
const EMAILUS = `${randomString(10)}@example.com`;
const PASSWORD = `${randomString(7)}`;
const baseURL = 'http://www.host1813334.hostland.pro/public/api';
const NAMELIST = `${randomString(40)}`

// Функция регистрации и авторизации (происходит единожды.
// Главная функция итерируется заданное кол-во раз. Эта срабатывает перед ней только один раз )
export function setup() {

    let res = http.post(`${baseURL}/user`, {
        name: USERNAME,
        email: EMAILUS,
        password: PASSWORD,
        password_confirmation: PASSWORD,
    });

    // Чек запроса
    check(res, { 'true': () => res.status === 201 });

    // Авторизация пользователя
    let loginRes = http.post(`${baseURL}/login`, {
        email: EMAILUS,
        password: PASSWORD,
    });

    // Получение токена
    let authToken = loginRes.json('api_token');
    check(authToken, { 'true': () => authToken !== '', });

    return authToken;
}

// Главная функция. Происходит итерация запросов
export default function(authToken) {
    // Параметр для авторизации - токен
    const options = ({
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    });
    // чекнуть, все ли корректно работает
    console.log(authToken);

    // Отправляем запрос на создание листа
    const res = http.post(`${baseURL}/list`, {
        name: NAMELIST,
        description: "description",
    }, options);
    console.log(`Creat list ${res.status} ${res.body}`);

    // Получение id_list листа
    let list_id = res.json('list_id');
    check(list_id, { 'true': () => list_id !== '', });
    console.log(list_id);



    sleep(1);
}


