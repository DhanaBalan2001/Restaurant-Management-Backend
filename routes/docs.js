import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  const apiEndpoints = {
    "Restaurant Management System API": {
      "Authentication": {
        "POST /api/auth/login": "User login",
        "POST /api/auth/register": "User registration",
        "GET /api/auth/verify": "Verify user token"
      },
      "Admin Management": {
        "GET /api/admin/users": "Get all users",
        "POST /api/admin/users": "Create new user",
        "PUT /api/admin/users/:id": "Update user",
        "DELETE /api/admin/users/:id": "Delete user"
      },
      "Reports & Analytics": {
        "GET /api/reports/daily": "Daily sales report with revenue and popular items",
        "GET /api/reports/monthly": "Monthly sales analysis with revenue trends",
        "GET /api/reports/peak-hours": "Peak hours analysis with customer traffic",
        "GET /api/reports/menu-metrics": "Menu performance metrics and insights"
      },
      "Menu Management": {
        "GET /api/menu": "Get all menu items",
        "POST /api/menu": "Add new menu item",
        "PUT /api/menu/:id": "Update menu item",
        "DELETE /api/menu/:id": "Delete menu item"
      },
      "Order Management": {
        "GET /api/orders": "Get all orders",
        "POST /api/orders": "Create new order",
        "PUT /api/orders/:id": "Update order status",
        "GET /api/orders/status/:status": "Get orders by status"
      },
      "Branch Management": {
        "GET /api/branches": "Get all branches",
        "POST /api/branches": "Add new branch",
        "PUT /api/branches/:id": "Update branch details",
        "DELETE /api/branches/:id": "Delete branch"
      },
      "Table Management": {
        "GET /api/tables": "Get all tables",
        "POST /api/tables": "Add new table",
        "PUT /api/tables/:id": "Update table status",
        "DELETE /api/tables/:id": "Delete table"
      },
      "Reservations": {
        "GET /api/reservations": "Get all reservations",
        "POST /api/reservations": "Create new reservation",
        "PUT /api/reservations/:id": "Update reservation",
        "DELETE /api/reservations/:id": "Cancel reservation"
      },
      "Inventory": {
        "GET /api/inventory": "Get inventory items",
        "POST /api/inventory": "Add inventory item",
        "PUT /api/inventory/:id": "Update inventory",
        "DELETE /api/inventory/:id": "Remove inventory item"
      },
      "Real-time Kitchen Updates": {
        "Socket: kitchen_${branchId}": "Kitchen room for specific branch",
        "Event: newOrder": "Real-time new order notification",
        "Event: orderStatusUpdate": "Order status updates",
        "Event: statusUpdated": "Broadcast status changes"
      }
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Restaurant API Documentation</title>
        <style>
          body {
             font-family: Arial, sans-serif;
             margin: 40px;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          h1 {
             color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
          }
          h2 {
            color: #34495e;
            margin-top: 30px;
          }
          .endpoint {
            margin: 15px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
            border-left: 4px solid #3498db;
          }
          .method {
            color: #2980b9;
            font-weight: bold;
            font-size: 1.1em;
          }
          .path {
            color: #555;
            margin: 5px 0;
          }
          .description {
            color: #666;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Restaurant Management System API Documentation</h1>
          ${Object.entries(apiEndpoints["Restaurant Management System API"]).map(([category, endpoints]) => `
            <h2>${category}</h2>
            ${Object.entries(endpoints).map(([path, description]) => `
              <div class="endpoint">
                <div class="method">${path.split(' ')[0]}</div>
                <div class="path">${path.split(' ')[1] || path}</div>
                <div class="description">${description}</div>
              </div>
            `).join('')}
          `).join('')}
        </div>
      </body>
    </html>
  `;

  res.send(html);
});

export default router;