import http from 'k6/http';
import { check, group } from 'k6';

// The URL is http://localhost:3000 when running locally on the server,
// and http://unimatrix52.nl:3000 when running on the server.
const URL = 'http://localhost:3000';
// Default credentials from seeder
const USERNAME = 'admin';
const PASSWORD = 'admin!';

/**
 * All tests were run for 60 seconds.
 */
export const options = {
  vus: 100,
  duration: '60s',
};

/**
 * The setup function is called once before the test starts.
 * This generates a login cookie that is used among the tests. 
 * 
 * @returns {Object} The login cookie
 */
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

/**
 * The main functon that is called for each virtual user.
 * 
 * @param {Object} data 
 */
export default function (data) {
    // Store the cookie for each request to be used
    const jar = http.cookieJar();
    jar.set(URL, 'gp_session', data.loginCookie, {
        replace: true
    });

    // Visiting the live page
    group('Live page (/live)', function () {
        group('Visit live page', function () {
            const responses = http.batch([
                URL,
                `${URL}/assets/index-5993fba7.css.gz`,
                `${URL}/assets/index-35ac69b9.js.gz`,
            ]);

            // This check statement asserts the response.
            check(responses[0], { 'Visited live page': (response) => response.status === 200 });
            check(responses[1], { 'Loaded css': (response) => response.status === 200 });
            check(responses[2], { 'Loaded js': (response) => response.status === 200 });
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
        const max = 50; // indexes 1-50 (depends on the number of thingies in the database)
        // Three random thingies to inspect
        const first = Math.ceil(Math.random() * max);
        const second = Math.ceil(Math.random() * max);
        const third = Math.ceil(Math.random() * max);

        group('Load all thingies', function () {
            const response = http.get(`${URL}/api/thingy/all`);
            
            const success = response.json('success');
            check(success, { 'Retrieved all thingies': () => success === true });
        });

        group(`Inspecting thingy with id ${first} (/api/thingy/inspect/${first})`, function () {
            const response = http.get(`${URL}/api/thingy/inspect/${first}`);

            const success = response.json('success');
            check(success, { 'Retrieved first thingy information': () => success === true });
        });

        group(`Inspecting thingy with id ${second} (/api/thingy/inspect/${second})`, function () {
            const response = http.get(`${URL}/api/thingy/inspect/${second}`);

            const success = response.json('success');
            check(success, { 'Retrieved second thingy information': () => success === true });
        });

        group(`Inspecting thingy with id ${third} (/api/thingy/inspect/${third})`, function () {
            const response = http.get(`${URL}/api/thingy/inspect/${third}`);

            const success = response.json('success');
            check(success, { 'Retrieved third thingy information': () => success === true });
        });
    });

    // Visiting the historical page by requesting a random sample
    group('Visiting historical page (/historical)', function () {
        const availableSamples = ['1m', '5m', '10m', '15m', '30m'];
        const randomSample = availableSamples[Math.floor(Math.random() * availableSamples.length)];

        group(`Retrieving historical data for ${randomSample} (/api/historical/sample/${randomSample})`, function () {
            const response = http.get(`${URL}/api/historical/sample/${randomSample}`);

            const success = response.json('success');
            check(success, { 'Retrieved historical data': () => success === true });
        });
    });
}

/**
 * This function handles the output to a json file, it dynamically generates a filename based on the options.
 * 
 * @param {*} summary 
 * @returns 
 */
export function handleSummary(summary) {
    console.log('Preparing the end-of-test summary...');
    let result = {};
    result[`${options.vus}_${options.duration}_${Date.now()}_js_css.json`] = JSON.stringify(summary);
    return result;
}