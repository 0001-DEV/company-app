const axios = require('axios');

async function testApi() {
  try {
    // 1. Login
    const loginRes = await axios.post('http://localhost:5000/api/admin/login', {
      email: 'testadmin@test.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log("Logged in. Token acquired.");

    // 2. Find AHUSG BAKERY
    const projectsRes = await axios.get('http://localhost:5000/api/admin/client-projects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const project = projectsRes.data.find(p => p.companyName.includes('AHUSG BAKERY'));
    if (!project) throw new Error("Project not found");
    console.log(`Found project: ${project._id}. Current cardsUsed: ${project.cardsUsed}`);

    // 3. Deduct
    const deductRes = await axios.put(`http://localhost:5000/api/admin/client-project/${project._id}`, {
      addCardsUsed: 3,
      deductionNote: 'Native Test Script'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("API Success! Response cardsUsed:", deductRes.data.cardsUsed);
    console.log("History entry count in response:", deductRes.data.deductionHistory.length);
    console.log("Latest history entry:", deductRes.data.deductionHistory[deductRes.data.deductionHistory.length - 1]);

  } catch (err) {
    console.error("API TEST FAILED:");
    if (err.response) {
      console.error(err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

testApi();
