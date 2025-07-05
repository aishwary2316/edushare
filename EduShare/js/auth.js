// TeacherShare - Authentication Handler
// Handles user authentication, form submissions, and route protection

// Wait for DOM to be fully loaded
window.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupAuthForms();
    setupTabSwitching();
    protectDashboard();
});

// Initialize authentication state listeners
function initializeAuth() {
    // Listen for authentication state changes
    auth.onAuthStateChanged(function(user) {
        if (user) {
            console.log('User signed in:', user.email);
            // Store user info for easy access
            window.currentUser = user;
        } else {
            console.log('User signed out');
            window.currentUser = null;
        }
    });
}

// Setup form event listeners for sign up and sign in
function setupAuthForms() {
    const signupForm = document.getElementById('signup-form');
    const signinForm = document.getElementById('signin-form');

    // Handle sign up form submission
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignUp();
        });
    }

    // Handle sign in form submission
    if (signinForm) {
        signinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignIn();
        });
    }
}

// Handle user sign up
function handleSignUp() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    // Basic validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    // Create user with email and password
    auth.createUserWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            // Sign up successful
            console.log('Sign up successful:', userCredential.user.email);
            
            // Create user profile document in Firestore
            return db.collection('profiles').doc(userCredential.user.uid).set({
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                photoURL: '',
                institute: '',
                bio: ''
            });
        })
        .then(function() {
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        })
        .catch(function(error) {
            console.error('Sign up error:', error);
            alert('Sign up failed: ' + error.message);
        });
}

// Handle user sign in
function handleSignIn() {
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    // Basic validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    // Sign in with email and password
    auth.signInWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            // Sign in successful
            console.log('Sign in successful:', userCredential.user.email);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        })
        .catch(function(error) {
            console.error('Sign in error:', error);
            alert('Sign in failed: ' + error.message);
        });
}

// Setup tab switching functionality for auth page
// function setupTabSwitching() {
//     const tabButtons = document.querySelectorAll('.tab-button');
//     const tabContents = document.querySelectorAll('.tab-content');

//     tabButtons.forEach(function(button) {
//         button.addEventListener('click', function() {
//             const targetTab = this.getAttribute('data-tab');
            
//             // Remove active class from all buttons and contents
//             tabButtons.forEach(function(btn) {
//                 btn.classList.remove('active');
//             });
//             tabContents.forEach(function(content) {
//                 content.classList.remove('active');
//             });
            
//             // Add active class to clicked button and corresponding content
//             this.classList.add('active');
//             document.getElementById(targetTab + '-tab').classList.add('active');
//         });
//     });
// }

// Setup tab switching functionality for auth page
// This function allows users to switch between sign up and sign in tabs
function setupTabSwitching() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  console.log('🔘 Found', tabButtons.length, 'tab buttons and', tabContents.length, 'tab contents');

  tabButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      console.log('👉 Clicked tab:', this.dataset.tab);

      const targetTab = this.getAttribute('data-tab');
      
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      this.classList.add('active');
      const pane = document.getElementById(targetTab + '-tab');
      if (pane) {
        console.log('✅ Showing pane:', targetTab + '-tab');
        pane.classList.add('active');
      } else {
        console.warn('⚠️ No pane found with id:', targetTab + '-tab');
      }
    });
  });
}


// Protect dashboard.html - redirect if not authenticated
function protectDashboard() {
    // Only run protection on dashboard page
    if (window.location.pathname.includes('dashboard.html')) {
        auth.onAuthStateChanged(function(user) {
            if (!user) {
                // User is not authenticated, redirect to auth page
                console.log('User not authenticated, redirecting to auth page');
                window.location.href = 'auth.html';
            }
        });
    }
}

// Logout function - can be called from anywhere
function logout() {
    auth.signOut()
        .then(function() {
            console.log('User signed out successfully');
            window.location.href = 'index.html';
        })
        .catch(function(error) {
            console.error('Sign out error:', error);
            alert('Sign out failed: ' + error.message);
        });
}

// Make logout function globally available
window.logout = logout;

// Utility function to get current user
function getCurrentUser() {
    return auth.currentUser;
}

// Make utility functions globally available
window.getCurrentUser = getCurrentUser;