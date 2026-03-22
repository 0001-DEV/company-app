const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ body: JSON.parse(data), status: res.statusCode }));
    });
    req.on('error', (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  try {
    // 1. Admin login
    const login = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'testadmin@test.com', password: 'password123' });

    if (login.status !== 200) throw new Error("Login failed: " + JSON.stringify(login.body));
    const token = login.body.token;
    console.log("Logged in.");

    // 2. Get projects
    const get = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/client-projects',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const p = get.body.find(x => x.companyName === 'AHUSG BAKERY');
    if (!p) throw new Error("Project not found");
    console.log(`Initial history count: ${p.deductionHistory.length}`);

    // 3. Update
    const update = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/admin/client-project/${p._id}`,
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      }
    }, { addCardsUsed: 3, deductionNote: 'Native Script Test' });

    console.log("Update status:", update.status);
    console.log("New history count:", update.body.deductionHistory.length);
    console.log("Last history note:", update.body.deductionHistory[update.body.deductionHistory.length - 1].note);

  } catch (err) {
    console.error(err);
  }
}

run();
