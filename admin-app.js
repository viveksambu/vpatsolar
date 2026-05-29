// =====================================================
// VPAT CRM APP LOGIC (FIREBASE ONLY INTEGRATION)
// =====================================================

import { db } from "./firebase-config.js";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// AUTH CHECK
function checkAuth() {
    const authData = localStorage.getItem("vpat_admin_auth");
    if (!authData && !window.location.pathname.includes("admin-login.html")) {
        window.location.href = "admin-login.html";
        return null;
    }
    return authData ? JSON.parse(authData) : null;
}

// Initialize authenticated user
const user = checkAuth();

if (user && !window.location.pathname.includes("admin-login.html")) {
    document.addEventListener("DOMContentLoaded", () => {
        const nameEl = document.getElementById("userName");
        const roleEl = document.getElementById("userRole");
        const avatarEl = document.getElementById("userAvatar");

        if (nameEl) nameEl.innerText = user.name;
        if (roleEl) roleEl.innerText = user.role;
        if (avatarEl) avatarEl.innerText = user.name.charAt(0);

        // Employee Restrictions
        if (user.role === "Employee") {
            if (window.location.pathname.includes("admin-dashboard.html")) {
                window.location.href = "admin-leads.html";
            }
            document.querySelectorAll(".admin-only").forEach(el => {
                el.style.display = "none";
            });
        }
    });
}

// LOGOUT
function logout() {
    localStorage.removeItem("vpat_admin_auth");
    window.location.href = "admin-login.html";
}

// SIDEBAR TOGGLE
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
        sidebar.classList.toggle("open");
    }
}

// DEFAULT MOCK SEED DATA
const defaultUsers = [
    {
        id: 'EMP-001',
        name: 'VPAT Owner',
        phone: '9515455449',
        password: 'admin',
        role: 'Admin',
        status: 'Active'
    },
    {
        id: 'EMP-002',
        name: 'Test Employee',
        phone: '1234567890',
        password: 'vpatemp1',
        role: 'Employee',
        status: 'Active'
    }
];

const defaultLeads = [
    {
        id: 'LD-4829',
        name: 'Rajesh Kumar',
        phone: '9876543210',
        email: 'rajesh.k@gmail.com',
        type: 'Residential',
        address: 'Plot 45, Jubilee Hills, Hyderabad',
        bill: '8000',
        load: '5',
        finalPrice: '260000',
        system: 'On-grid',
        status: 'Completed',
        trackingStatus: 'Installed',
        notes: 'Looking for high-efficiency mono-perc panels. Subsidy papers processed.',
        createdAt: '2026-05-10',
        createdBy: '9515455449'
    },
    {
        id: 'LD-1948',
        name: 'Sunitha Rao',
        phone: '8765432109',
        email: 'sunitha.rao@yahoo.com',
        type: 'Residential',
        address: 'Srinagar Colony, Mahabubnagar',
        bill: '4500',
        load: '3',
        finalPrice: '170000',
        system: 'On-grid',
        status: 'Site Visit Scheduled',
        trackingStatus: 'Site Visited',
        notes: 'Site visit completed. Shade analysis done on north-east corner.',
        createdAt: '2026-05-15',
        createdBy: '9515455449'
    },
    {
        id: 'LD-3928',
        name: 'Sri Sai Rice Mill',
        phone: '7654321098',
        email: 'contact@srisairice.com',
        type: 'Industrial',
        address: 'Industrial Area, Jadcherla',
        bill: '95000',
        load: '50',
        finalPrice: '2100000',
        system: 'Hybrid',
        status: 'Negotiation',
        trackingStatus: 'Confirmed',
        notes: 'High power requirement. Negotiating subsidy and billing cycle adjustments.',
        createdAt: '2026-05-20',
        createdBy: '1234567890'
    },
    {
        id: 'LD-7294',
        name: 'Venkatesh Prasad',
        phone: '9515455449',
        email: 'venky.p@outlook.com',
        type: 'Commercial',
        address: 'Venkateswara Hospital, Badepally, Jadcherla',
        bill: '15000',
        load: '10',
        finalPrice: '480000',
        system: 'On-grid',
        status: 'New Lead',
        trackingStatus: 'Pending / New',
        notes: 'Interested in reducing operational overheads. Quick response requested.',
        createdAt: '2026-05-28',
        createdBy: '1234567890'
    }
];

// =====================================================
// FIREBASE DATA FUNCTIONS (EXPOSED GLOBALLY)
// =====================================================

// GET USERS (With cloud Firestore lookup, fallback, and self-seeding)
async function getUsers() {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = [];
        querySnapshot.forEach((doc) => {
            usersList.push(doc.data());
        });

        // Database Self-Seeding if empty
        if (usersList.length === 0) {
            console.log("Firestore users collection is empty. Seeding defaults...");
            for (const u of defaultUsers) {
                await setDoc(doc(db, "users", u.id), u);
                usersList.push(u);
            }
        }

        // Cache local backup
        localStorage.setItem("vpat_users", JSON.stringify(usersList));
        return usersList;
    } catch (error) {
        console.warn("Firebase getUsers error (using localStorage fallback):", error);
        const cached = localStorage.getItem("vpat_users");
        if (cached) return JSON.parse(cached);
        
        // Initial fallback seed
        localStorage.setItem("vpat_users", JSON.stringify(defaultUsers));
        return defaultUsers;
    }
}

// SAVE USER TO FIREBASE
async function saveUser(userObj) {
    try {
        await setDoc(doc(db, "users", userObj.id), userObj);
        console.log(`Saved user ${userObj.id} to Firestore`);
    } catch (error) {
        console.error("Firebase saveUser failed:", error);
    }
    
    // Always update local cache
    const users = JSON.parse(localStorage.getItem("vpat_users")) || defaultUsers;
    const idx = users.findIndex(u => u.id === userObj.id);
    if (idx !== -1) {
        users[idx] = userObj;
    } else {
        users.push(userObj);
    }
    localStorage.setItem("vpat_users", JSON.stringify(users));
}

// DELETE USER FROM FIREBASE
async function deleteUser(userId) {
    try {
        await deleteDoc(doc(db, "users", userId));
        console.log(`Deleted user ${userId} from Firestore`);
    } catch (error) {
        console.error("Firebase deleteUser failed:", error);
    }

    // Update local cache
    let users = JSON.parse(localStorage.getItem("vpat_users")) || defaultUsers;
    users = users.filter(u => u.id !== userId);
    localStorage.setItem("vpat_users", JSON.stringify(users));
}

// GET LEADS (With cloud Firestore lookup, sorting, fallback, and self-seeding)
async function getLeads() {
    try {
        // Query ordered by createdAt descending
        const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const leadsList = [];
        querySnapshot.forEach((doc) => {
            leadsList.push(doc.data());
        });

        // Database Self-Seeding if empty
        if (leadsList.length === 0) {
            console.log("Firestore leads collection is empty. Seeding defaults...");
            for (const l of defaultLeads) {
                await setDoc(doc(db, "leads", l.id), l);
                leadsList.push(l);
            }
        }

        // Cache local backup
        localStorage.setItem("vpat_leads", JSON.stringify(leadsList));
        return leadsList;
    } catch (error) {
        console.warn("Firebase getLeads error (using localStorage fallback):", error);
        const cached = localStorage.getItem("vpat_leads");
        if (cached) return JSON.parse(cached);

        // Initial fallback seed
        localStorage.setItem("vpat_leads", JSON.stringify(defaultLeads));
        return defaultLeads;
    }
}

// SAVE LEAD TO FIREBASE
async function saveLead(leadObj) {
    try {
        await setDoc(doc(db, "leads", leadObj.id), leadObj);
        console.log(`Saved lead ${leadObj.id} to Firestore`);
    } catch (error) {
        console.error("Firebase saveLead failed:", error);
    }

    // Always update local cache
    const leads = JSON.parse(localStorage.getItem("vpat_leads")) || defaultLeads;
    const idx = leads.findIndex(l => l.id === leadObj.id);
    if (idx !== -1) {
        leads[idx] = leadObj;
    } else {
        leads.unshift(leadObj);
    }
    localStorage.setItem("vpat_leads", JSON.stringify(leads));
}

// DELETE LEAD FROM FIREBASE
async function deleteLead(leadId) {
    try {
        await deleteDoc(doc(db, "leads", leadId));
        console.log(`Deleted lead ${leadId} from Firestore`);
    } catch (error) {
        console.error("Firebase deleteLead failed:", error);
    }

    // Update local cache
    let leads = JSON.parse(localStorage.getItem("vpat_leads")) || defaultLeads;
    leads = leads.filter(l => l.id !== leadId);
    localStorage.setItem("vpat_leads", JSON.stringify(leads));
}

// EXPOSE TO GLOBAL SCOPE
window.user = user;
window.checkAuth = checkAuth;
window.logout = logout;
window.toggleSidebar = toggleSidebar;
window.getMockUsers = getUsers;
window.saveUser = saveUser;
window.deleteUser = deleteUser;
window.getMockLeads = getLeads;
window.saveLead = saveLead;
window.deleteLead = deleteLead;

console.log("VPAT CRM Firebase Core Module Active");
