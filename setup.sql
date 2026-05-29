CREATE DATABASE IF NOT EXISTS vpat_crm;
USE vpat_crm;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    type VARCHAR(50),
    address TEXT,
    bill VARCHAR(50),
    load_kw VARCHAR(50),
    final_price VARCHAR(50),
    system_type VARCHAR(50),
    status VARCHAR(50),
    notes TEXT,
    tracking_status VARCHAR(50),
    created_at DATE,
    created_by VARCHAR(50)
);

-- Insert default admin and employee
INSERT IGNORE INTO users (id, name, phone, password, role, status) VALUES 
('EMP-001', 'VPAT Owner', '9515455449', 'admin', 'Admin', 'Active');
INSERT IGNORE INTO users (id, name, phone, password, role, status) VALUES 
('EMP-002', 'Test Employee', '123456789', 'vpatemp1', 'Employee', 'Active');
