import http from 'k6/http';
import { check, group, fail } from 'k6';

const URL = 'http://unimatrix52.nl:3000';
const USERNAME = 'admin';
const PASSWORD = 'admin!';

export const options = {
  vus: 8,
  duration: '10s',
};

export function setup() {
    // Getting the cookie
    const loginRes = http.post(`${URL}/api/auth/login/`, {
        username: USERNAME,
        password: PASSWORD,
    });

    const success = loginRes.json('success');
    check(success, { 'logged in successfully': () => success === true });

    return { 
        loginCookie: loginRes.cookies.gp_session[0].value
    };
}

export default function (data) {
    const jar = http.cookieJar();
    jar.set(URL, 'gp_session', data.loginCookie, {
        replace: true
    });

    group('Live page (/live)', function () {
        group('Visit live page', function () {
            const responses = http.batch([
                URL,
                // `${URL}/assets/index-c51f7dfb.css`,
                // `${URL}/assets/index-22761c4a.js`,
            ]);

            // const success = response.status;
            check(responses[0], { 'Visited live page': (response) => response.status === 200 });
            // check(responses[1], { 'Loaded css': (response) => response.status === 200 });
            // check(responses[2], { 'Loaded js': (response) => response.status === 200 });
        });

        group('Retrieving user information', function () {
            const response = http.get(`${URL}/api/user`);

            const success = response.json('success');
            check(success, { 'Retrieved user information': () => success === true });
        });

        group('Retrieving last locations (/api/live/last-locations)', function () {
            const response = http.get(`${URL}/api/live/last-locations`);

            const success = response.json('success');
            check(success, { 'Retrieved last locations': () => success === true });
        });
    });

    group('Visiting thingies page (/thingies)', function () {
        const response = http.get(URL);

        const success = response.status;
        check(success, { 'Visited thingies page': () => success === 200 });
    });

    group('Visiting historical page (/historical)', function () {
        group('Visit historical page', function () {
            const response = http.get(URL);

            const success = response.status;
            check(success, { 'Visited historical page': () => success === 200 });
        });

        const availableSamples = ['1m', '5m', '10m', '15m', '30m'];
        const randomSample = availableSamples[Math.floor(Math.random() * availableSamples.length)];

        group(`Retrieving historical data for ${randomSample} (/api/historical/sample/${randomSample})`, function () {
            const response = http.get(`${URL}/api/historical/sample/${randomSample}`);

            const success = response.json('success');
            check(success, { 'Retrieved historical data': () => success === true });
        });
    });

    // group('visit home page', function () {
    //     const response = http.get(`${URL}/live`, {
    //         cookies: {
    //             gp_session: {
    //                 value: 's%3A5CGdnA79k-6TW4GMtBe0G7QD3UKncvcI.B5Ru0ltAhRaK0VBQXN%2BUB1uVIgXQRcivBpSG70HNVpI',
    //                 replace: true
    //             }
    //         }
    //     });
    //     // const success = response.json('success');
    //     // check(success, { 'logged in successfully': () => success === true });
    // });

    // group('visit live page', function () {
    //     http.get(`${URL}/live/`);
    //     console.log('visited live page');
    //     // sleep(1);
    // });

    // group('visit thingies thingies', function () {
    //     http.get(`${URL}/thingies/`);
    //     console.log('visited thingies page');
    //     sleep(1);
    // });

    // group('visit historical thingies', function () {
    //     http.get(`${URL}/historical/`);
    //     console.log('visited historical page');
    //     sleep(1);
    // });

}