import http from 'k6/http';
import {check, group, sleep, fail} from 'k6';

import { generateSubscriber } from './generators/subscriber';
const BASEURL = 'http://www.host1813334.hostland.pro/public/api';

// export let options = {
//     stages: [
//         { vus: 5, duration: '10s' },
//     ],
//     thresholds: {
//         'http_req_duration': ['p(95)<500', 'p(99)<1500'],
//         'http_req_duration{name:PublicCrocs}': ['avg<400'],
//         'http_req_duration{name:Create}': ['avg<600', 'max<1000'],
//     },
// };

export default function() {
    const person = generateSubscriber();

    console.log(`${person.name}, ${person.email}, ${person.password}`);

    let res = http.post(`${BASEURL}/user`, {
        name: person.name,
        email: person.email,
        password: person.password,
        password_confirmation: person.password,
    });

    console.log(`CREATE USER ${res.status} ${res.body}`);
    check(res, { 'true': () => res.status === 201 });
    sleep(1);


    let loginRes = http.post(`${BASEURL}/login`, {
        email: person.email,
        password: person.password,
    });

    // Получение токена
    const authToken = loginRes.json('api_token');
    check(authToken, { 'true': () => authToken !== '', });
    sleep(1);


    // Забиваем токен
    const options = ({
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    });
    console.log(options);
    // Выдает статус 405

    // let resDelete = http.del(`${BASEURL}/logout`, null, options);
    // console.log(`Logout ${resDelete.status}`);
    // check(resDelete, {'DELETE ': () => resDelete.status === 200,});


}