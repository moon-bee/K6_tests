import http from 'k6/http';
import {check, group, sleep, fail} from 'k6';

// Еще разобраться с метриками
// Какие самые важные метрики при запросах?
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
const NAMELIST = `${randomString(40)}`;

var listt_id = null;
var task_id = null;

// Функция регистрации и авторизации (происходит единожды.
// Главная функция итерируется заданное кол-во раз. Эта срабатывает перед ней только один раз )
export function setup() {

    // Переменные для запросов
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
    // Можно ли создание множества листов вынести за пределы главной функции?
    group (`Creat list`, () => {
        const param = {name: NAMELIST, description: "description",};
        const res = http.post(`${baseURL}/list`, param, options);
        console.log(`Creat list ${res.status} ${res.body}`);

        const isSuccessfulCreatList = check(res, {
            'Update worked': () => res.status === 200,
        });

        // Получение id_list листа
        listt_id = res.json('list_id');
        check(listt_id, { 'true': () => listt_id !== '', });
        console.log(`listt_id ${listt_id}`);
    });

    sleep(2);

    // Создание задачи
    // Можно ли создание множества тасков вынести за пределы главной функции?
    group (`Creat task`, () => {
        // Параметры
        const param_task = {
            name: NAMELIST,
            urgency: "3",
            description: "description",
            listt_id: `${listt_id}`
        };
        // Сам запрос
        const reslist = http.post(`${baseURL}/task`, param_task, options);
        console.log(`CREAT TASK  ${reslist.status} ${reslist.body}`);

        const isSuccessfulCreatTask = check(reslist, {
            'Update worked': () => reslist.status === 200,
        });

        // Получение id_list листа
        task_id = reslist.json('task_id');
        check(task_id, { 'true': () => task_id !== '', });
        console.log(`task_id ${task_id}`);
    })

    sleep(2);

    // Удаление задачи и подзадч
    // Можно ли удаление также вынести за пределы главной функции?
    group (`Delete list`, () => {
        let resDelete = http.del(`${baseURL}/list/${listt_id}`, null, options);
        console.log(`DELETE LIST ${resDelete.status} ${resDelete.body}`);
        const isSuccessfulDeleteList = check(resDelete, {
            'DELETE ': () => resDelete.status === 200,
        });
    });

    // Думаю как сократить и оптимизировать код

    // ПРОБЛЕМА!!! В функцию отправляется только один токен,
    // я хочу сделать несколько задач и подзадач для одно пользователя, а потом выйти
    // что-то похожее на tests и pre-request script в Postman


    // let resLogout = http.del(`${baseURL}/logout`, null, options);
    // console.log(`Logout user  ${resLogout.status} ${resLogout.body}`);
    // const isSuccessfulUpdate = check(resLogout, {
    //     'Logout ': () => resLogout.status === 200,
    // });

    sleep(1);
}


