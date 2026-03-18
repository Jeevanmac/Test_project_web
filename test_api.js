const http = require('http');

const post = (path, data) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });

    req.on('error', (e) => reject(e));
    req.write(JSON.stringify(data));
    req.end();
  });
};

async function test() {
  try {
    console.log('Testing Registration...');
    const reg = await post('/api/auth/register', { name: "Test User", email: "test2@example.com", password: "password123" });
    console.log('Reg Response:', reg);

    console.log('Testing Login...');
    const login = await post('/api/auth/login', { email: "test2@example.com", password: "password123" });
    console.log('Login Response:', login);

    if (login.user && login.user.id) {
       console.log('Success: Auth working.');
    } else {
       console.log('Failure: Auth failed.');
    }
  } catch (err) {
    console.error('Error during test:', err.message);
  }
}

test();
