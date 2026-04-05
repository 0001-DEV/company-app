module.exports = (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Company App</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            text-align: center;
        }
        .container {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            max-width: 400px;
        }
        .btn {
            display: block;
            width: 100%;
            padding: 15px;
            margin: 10px 0;
            background: rgba(255,255,255,0.2);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.3);
            font-size: 16px;
            transition: all 0.3s ease;
        }
        .btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
        .logo {
            font-size: 48px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🏢</div>
        <h1>Welcome to Identifiner</h1>
        <p>Company Management System</p>
        <div>
            <a href="/admin-login" class="btn">👑 Admin Login</a>
            <a href="/staff-login" class="btn">👤 Staff Login</a>
        </div>
        <p><small>API Status: <a href="/api/test" style="color: #90EE90;">✅ Working</a></small></p>
        <p><small>Note: This is served via API function since static files aren't working</small></p>
    </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
};