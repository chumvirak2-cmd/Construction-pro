CREATE DATABASE IF NOT EXISTS construction_pro;
USE construction_pro;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
  user_type ENUM('company_admin', 'worker') NOT NULL DEFAULT 'worker',
  management_level ENUM('super_admin', 'company_admin', 'manager', 'supervisor', 'worker', 'viewer') NOT NULL DEFAULT 'worker',
  company_id VARCHAR(255),
  department ENUM('marketing', 'sales', 'operations', 'mep', 'finance', 'hr'),
  permissions JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  logo_url TEXT,
  subscription_id VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  address TEXT,
  logo_url TEXT,
  subscription_id VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  building_type VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status ENUM('planning', 'in_progress', 'on_hold', 'completed', 'cancelled') NOT NULL DEFAULT 'planning',
  systems JSON,
  it_systems JSON,
  budget DECIMAL(15, 2) NOT NULL DEFAULT 0,
  actual_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
  manager VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workers (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  skills JSON,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  date_of_birth DATE,
  address TEXT,
  photo TEXT,
  hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  daily_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  overtime_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  join_date DATE NOT NULL,
  status ENUM('active', 'inactive', 'on_leave') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  sub_category VARCHAR(100),
  description TEXT,
  quantity INT NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  min_quantity INT NOT NULL DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  supplier VARCHAR(255),
  location VARCHAR(255),
  last_restocked DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS boqs (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  items JSON NOT NULL,
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('draft', 'sent', 'approved') NOT NULL DEFAULT 'draft',
  INDEX idx_boqs_project_id (project_id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(255) PRIMARY KEY,
  worker_id VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  check_in DATETIME,
  check_out DATETIME,
  location JSON,
  status ENUM('present', 'absent', 'late', 'overtime') NOT NULL DEFAULT 'present',
  notes TEXT,
  INDEX idx_attendance_worker_id (worker_id),
  INDEX idx_attendance_date (date)
);

CREATE TABLE IF NOT EXISTS payroll (
  id VARCHAR(255) PRIMARY KEY,
  worker_id VARCHAR(255) NOT NULL,
  month VARCHAR(7) NOT NULL,
  year INT NOT NULL,
  regular_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
  overtime_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
  deductions DECIMAL(10, 2) NOT NULL DEFAULT 0,
  bonuses DECIMAL(10, 2) NOT NULL DEFAULT 0,
  net_pay DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status ENUM('draft', 'pending', 'paid') NOT NULL DEFAULT 'draft',
  INDEX idx_payroll_worker_id (worker_id),
  INDEX idx_payroll_month (month)
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id VARCHAR(255) PRIMARY KEY,
  items JSON NOT NULL,
  supplier VARCHAR(255) NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  status ENUM('draft', 'pending', 'approved', 'received', 'cancelled') NOT NULL DEFAULT 'draft',
  order_date DATE NOT NULL,
  expected_delivery DATE,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  tier ENUM('free', 'starter', 'professional', 'enterprise') NOT NULL DEFAULT 'free',
  status ENUM('active', 'past_due', 'canceled', 'trialing', 'unpaid', 'none') NOT NULL DEFAULT 'none',
  current_period_start DATETIME NOT NULL,
  current_period_end DATETIME NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  aba_transaction_id VARCHAR(255),
  INDEX idx_subscriptions_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS team_members (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  company_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role ENUM('manager', 'worker', 'viewer', 'marketing', 'sell') NOT NULL DEFAULT 'worker',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  permissions JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  invited_by VARCHAR(255),
  last_location JSON,
  is_tracking_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  INDEX idx_team_members_company_id (company_id),
  INDEX idx_team_members_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS worker_locations (
  id VARCHAR(255) PRIMARY KEY,
  phone VARCHAR(50) NOT NULL,
  worker_id VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2) NOT NULL DEFAULT 0,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  distance_from_site INT NOT NULL DEFAULT 0,
  is_outside_site BOOLEAN NOT NULL DEFAULT FALSE,
  INDEX idx_worker_locations_worker_id (worker_id),
  INDEX idx_worker_locations_timestamp (timestamp)
);

CREATE TABLE IF NOT EXISTS tracking_alerts (
  id VARCHAR(255) PRIMARY KEY,
  worker_id VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  worker_name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  distance_from_site INT NOT NULL DEFAULT 0,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'resolved') NOT NULL DEFAULT 'active',
  resolved_at DATETIME,
  INDEX idx_tracking_alerts_worker_id (worker_id),
  INDEX idx_tracking_alerts_status (status)
);

CREATE TABLE IF NOT EXISTS manager_notifications (
  id VARCHAR(255) PRIMARY KEY,
  type ENUM('geofence_violation', 'system', 'warning') NOT NULL DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  worker_id VARCHAR(255),
  worker_name VARCHAR(255),
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read` BOOLEAN NOT NULL DEFAULT FALSE,
  action_url TEXT,
  INDEX idx_manager_notifications_timestamp (timestamp)
);

CREATE TABLE IF NOT EXISTS site_config (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_meters INT NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS app_settings (
  id VARCHAR(255) PRIMARY KEY,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Bangkok',
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  daily_summary BOOLEAN NOT NULL DEFAULT FALSE,
  weekly_report BOOLEAN NOT NULL DEFAULT TRUE,
  theme ENUM('light', 'dark', 'system') NOT NULL DEFAULT 'system',
  default_project_view ENUM('grid', 'list') NOT NULL DEFAULT 'grid',
  auto_save BOOLEAN NOT NULL DEFAULT TRUE,
  compact_mode BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  company VARCHAR(255),
  contact_person VARCHAR(255),
  status ENUM('active', 'inactive', 'lead') NOT NULL DEFAULT 'lead',
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
