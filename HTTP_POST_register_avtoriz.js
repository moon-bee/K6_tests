import http from 'k6/http';
import {check, group, sleep, fail} from 'k6';

const baseURL = 'http://www.host1813334.hostland.pro/public/api';

// Регистрация и авторизация пользователя post запрос
export function setup() {
    let res = http.post(`${baseURL}/user`, {
        name: "USER_STRESS",
        email: "wowowo2345@boo.com",
        password: "PASSWORD",
        password_confirmation: "PASSWORD",
    });

    // Чек запроса
    check(res, { 'true': () => res.status === 201 });

    // Авторизация пользователя
    let loginRes = http.post(`${baseURL}/login`, {
        email: "wowowo2345@boo.com",
        password: "PASSWORD",
    });

    // Получение токена
    let authToken = loginRes.json('api_token');
    check(authToken, { 'true': () => authToken !== '', });

    return authToken;
}


export default function(authToken) {
    // Забиваем токен
    const options = ({
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    });
    console.log(authToken);

    // Отправляем запрос на создание листа
    const res = http.post(`${baseURL}/list`, {
        name: "EEEEEEE ppppppp",
        description: "description",
    }, options);
    console.log(`Creat list ${res.status} ${res.body}`);

    // Получение id_list листа
    let list_id = res.json('list_id');
    check(list_id, { 'true': () => list_id !== '', });
    console.log(list_id);

}