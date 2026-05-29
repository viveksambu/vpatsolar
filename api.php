<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow local development
require 'db.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if ($action === 'login') {
        $phone = $data['phone'];
        $password = $data['password'];
        $role = $data['role'];
        
        $stmt = $conn->prepare("SELECT id, name, phone, role, status FROM users WHERE phone=? AND password=? AND role=? AND status='Active'");
        $stmt->bind_param("sss", $phone, $password, $role);
        $stmt->execute();
        $res = $stmt->get_result();
        
        if ($res->num_rows > 0) {
            $user = $res->fetch_assoc();
            echo json_encode(['status' => 'success', 'user' => $user]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid credentials or inactive account']);
        }
    }
    else if ($action === 'saveUser') {
        $id = $data['id'];
        $name = $data['name'];
        $phone = $data['phone'];
        $password = $data['password'];
        $role = $data['role'];
        $status = $data['status'];
        
        // Check if user exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE id=?");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            $stmt = $conn->prepare("UPDATE users SET name=?, phone=?, password=?, role=?, status=? WHERE id=?");
            $stmt->bind_param("ssssss", $name, $phone, $password, $role, $status, $id);
        } else {
            $stmt = $conn->prepare("INSERT INTO users (id, name, phone, password, role, status) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("ssssss", $id, $name, $phone, $password, $role, $status);
        }
        
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => $conn->error]);
        }
    }
    else if ($action === 'deleteUser') {
        $id = $data['id'];
        $stmt = $conn->prepare("DELETE FROM users WHERE id=?");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        echo json_encode(['status' => 'success']);
    }
    else if ($action === 'saveLead') {
        $id = $data['id'];
        $name = $data['name'];
        $phone = $data['phone'];
        $email = $data['email'];
        $type = $data['type'];
        $address = $data['address'];
        $bill = $data['bill'];
        $load_kw = $data['load'];
        $final_price = $data['finalPrice'];
        $system_type = $data['system'];
        $status = $data['status'];
        $notes = $data['notes'];
        $created_at = $data['createdAt'];
        $created_by = $data['createdBy'];
        
        $stmt = $conn->prepare("SELECT id FROM leads WHERE id=?");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            $stmt = $conn->prepare("UPDATE leads SET name=?, phone=?, email=?, type=?, address=?, bill=?, load_kw=?, final_price=?, system_type=?, status=?, notes=? WHERE id=?");
            $stmt->bind_param("ssssssssssss", $name, $phone, $email, $type, $address, $bill, $load_kw, $final_price, $system_type, $status, $notes, $id);
        } else {
            // New leads default tracking to Pending / New
            $tracking_status = 'Pending / New';
            $stmt = $conn->prepare("INSERT INTO leads (id, name, phone, email, type, address, bill, load_kw, final_price, system_type, status, notes, tracking_status, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sssssssssssssss", $id, $name, $phone, $email, $type, $address, $bill, $load_kw, $final_price, $system_type, $status, $notes, $tracking_status, $created_at, $created_by);
        }
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => $conn->error]);
        }
    }
    else if ($action === 'deleteLead') {
        $id = $data['id'];
        $stmt = $conn->prepare("DELETE FROM leads WHERE id=?");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        echo json_encode(['status' => 'success']);
    }
    else if ($action === 'updateTracking') {
        $id = $data['id'];
        $tracking_status = $data['trackingStatus'];
        $lead_status = $data['status'] ?? null;
        
        if ($lead_status) {
            $stmt = $conn->prepare("UPDATE leads SET tracking_status=?, status=? WHERE id=?");
            $stmt->bind_param("sss", $tracking_status, $lead_status, $id);
        } else {
            $stmt = $conn->prepare("UPDATE leads SET tracking_status=? WHERE id=?");
            $stmt->bind_param("ss", $tracking_status, $id);
        }
        $stmt->execute();
        echo json_encode(['status' => 'success']);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'getUsers') {
        $res = $conn->query("SELECT id, name, phone, password, role, status FROM users");
        $users = [];
        while($row = $res->fetch_assoc()) {
            $users[] = $row;
        }
        echo json_encode(['status' => 'success', 'data' => $users]);
    }
    else if ($action === 'getLeads') {
        $res = $conn->query("SELECT id, name, phone, email, type, address, bill, load_kw as `load`, final_price as finalPrice, system_type as `system`, status, notes, tracking_status as trackingStatus, created_at as createdAt, created_by as createdBy FROM leads ORDER BY created_at DESC, id DESC");
        $leads = [];
        while($row = $res->fetch_assoc()) {
            $leads[] = $row;
        }
        echo json_encode(['status' => 'success', 'data' => $leads]);
    }
}
?>
