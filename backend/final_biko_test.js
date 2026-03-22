const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
          try {
              resolve({ body: JSON.parse(data), status: res.statusCode });
          } catch(e) {
              resolve({ body: data, status: res.statusCode });
          }
      });
    });
    req.on('error', (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  try {
    const login = await request({
      hostname: 'localhost', port: 5000, path: '/api/admin/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'finaltest@test.com', password: 'password123' });

    const token = login.body.token;
    const get = await request({
      hostname: 'localhost', port: 5000, path: '/api/admin/client-projects', method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const p = get.body.find(x => x.companyName === 'AHUSG BAKERY');
    const oldLen = p.deductionHistory.length;

    const update = await request({
      hostname: 'localhost', port: 5000, path: `/api/admin/client-project/${p._id}`, method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    }, { addCardsUsed: 1, deductionNote: 'FINAL BIKO TEST' });

    console.log(`DEDUCTION_RESULT: SUCCESS`);
    console.log(`OLD_HISTORY_COUNT: ${oldLen}`);
    console.log(`NEW_HISTORY_COUNT: ${update.body.deductionHistory.length}`);
    console.log(`LAST_NOTE: ${update.body.deductionHistory[update.body.deductionHistory.length - 1].note}`);

  } catch (err) {
    console.error("TEST FAILED:", err.message);
  }
}

run();
