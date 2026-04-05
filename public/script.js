// Simple navigation functions
function goToAdminLogin() {
    // For now, just show an alert - later this will navigate to the actual login
    alert('Admin Login - Coming Soon!\n\nThis will redirect to the admin login page.');
    // window.location.href = '/admin-login';
}

function goToStaffLogin() {
    // For now, just show an alert - later this will navigate to the actual login
    alert('Staff Login - Coming Soon!\n\nThis will redirect to the staff login page.');
    // window.location.href = '/staff-login';
}

// Test API connection on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add some interactive effects
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Optional: Test API connection
    fetch('/api/test')
        .then(response => response.json())
        .then(data => {
            console.log('API Connection:', data);
        })
        .catch(error => {
            console.log('API Connection failed:', error);
        });
});