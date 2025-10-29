import { auth, database } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    ref, 
    set, 
    get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

let selectedUserType = '';

window.selectUserType = function(type) {
    selectedUserType = type;
    document.getElementById('userTypeSelection').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    
    const loginTitle = document.getElementById('loginTitle');
    const signupTitle = document.getElementById('signupTitle');
    
    if (type === 'student') {
        loginTitle.textContent = 'Student Login';
        signupTitle.textContent = 'Student Registration';
    } else {
        loginTitle.textContent = 'Admin Login';
        signupTitle.textContent = 'Admin Registration';
    }
}

window.goBackToUserType = function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('userTypeSelection').style.display = 'block';
    selectedUserType = '';
}

window.showSignup = function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

window.showLogin = function() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

window.handleLogin = async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    showLoading(true);
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const userRef = ref(database, 'users/' + user.uid);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            const userData = snapshot.val();
            
            if (userData.userType === selectedUserType) {
                showMessage('Login successful! Redirecting...', 'success');
                
                sessionStorage.setItem('userType', userData.userType);
                sessionStorage.setItem('userName', userData.fullName);
                sessionStorage.setItem('userEmail', userData.email);
                sessionStorage.setItem('userId', user.uid);
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showMessage(`This account is registered as ${userData.userType}. Please select the correct user type.`, 'error');
                await auth.signOut();
            }
        } else {
            showMessage('User data not found. Please contact administrator.', 'error');
            await auth.signOut();
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage(getErrorMessage(error.code), 'error');
    } finally {
        showLoading(false);
    }
}

window.handleSignup = async function(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const age = document.getElementById('age').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long!', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await set(ref(database, 'users/' + user.uid), {
            fullName: fullName,
            age: age,
            email: email,
            phone: phone,
            address: address,
            userType: selectedUserType,
            createdAt: new Date().toISOString(),
            approved: selectedUserType === 'admin' ? false : true
        });
        
        showMessage('Account created successfully! Please login.', 'success');
        document.getElementById('signup').reset();
        
        setTimeout(() => {
            showLogin();
        }, 2000);
        
    } catch (error) {
        console.error('Signup error:', error);
        showMessage(getErrorMessage(error.code), 'error');
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'flex' : 'none';
}

function showMessage(message, type) {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const activeForm = document.querySelector('.form-section:not([style*="display: none"])');
    if (activeForm) {
        activeForm.insertBefore(messageDiv, activeForm.firstChild);
    }
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered. Please login instead.',
        'auth/invalid-email': 'Invalid email address format.',
        'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
        'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your connection.'
    };
    
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

onAuthStateChanged(auth, async (user) => {
    if (user && window.location.pathname.includes('login.html')) {
        const userRef = ref(database, 'users/' + user.uid);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            const userData = snapshot.val();
            
            if (userData.userType === 'admin' && !userData.approved) {
                showMessage('Your admin account is pending approval.', 'error');
                await auth.signOut();
                return;
            }
            
            window.location.href = 'index.html';
        }
    }
});

console.log('Authentication system initialized!');
