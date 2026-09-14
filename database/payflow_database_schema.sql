CREATE DATABASE IF NOT EXISTS payflow_db;
USE payflow_db;

-- 1. Business
CREATE TABLE business (
    business_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    business_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(20),
    address VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Roles
CREATE TABLE roles (
    role_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    business_id BIGINT NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    CONSTRAINT uq_role_business_name UNIQUE (business_id, role_name),
    CONSTRAINT uq_role_id_business UNIQUE (role_id, business_id),
    CONSTRAINT fk_role_business
        FOREIGN KEY (business_id)
        REFERENCES business(business_id)
);

-- 3. Employee
CREATE TABLE employee (
    employee_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    business_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    employee_code VARCHAR(30) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(150),
    phone VARCHAR(20),
    joining_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_employee_business_code
        UNIQUE (business_id, employee_code),

    CONSTRAINT fk_employee_business
        FOREIGN KEY (business_id)
        REFERENCES business(business_id),

    CONSTRAINT fk_employee_role
        FOREIGN KEY (role_id, business_id)
        REFERENCES roles(role_id, business_id),

    CONSTRAINT chk_employee_status
        CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 4. Salary Structure / Salary History
CREATE TABLE salary_structure (
    salary_structure_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    monthly_salary DECIMAL(12,2) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_salary_positive
        CHECK (monthly_salary >= 0),

    CONSTRAINT chk_salary_dates
        CHECK (effective_to IS NULL OR effective_to >= effective_from),

    CONSTRAINT fk_salary_employee
        FOREIGN KEY (employee_id)
        REFERENCES employee(employee_id),

    INDEX idx_salary_employee_effective (employee_id, effective_from)
);

-- 5. Attendance
CREATE TABLE attendance (
    attendance_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    check_in TIME,
    check_out TIME,
    notes VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_attendance_employee_date
        UNIQUE (employee_id, attendance_date),

    CONSTRAINT chk_attendance_status
        CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE')),

    CONSTRAINT fk_attendance_employee
        FOREIGN KEY (employee_id)
        REFERENCES employee(employee_id)
);

-- 6. Advance
CREATE TABLE advance (
    advance_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    advance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_advance_amount
        CHECK (amount > 0),

    CONSTRAINT chk_advance_status
        CHECK (status IN ('PENDING', 'DEDUCTED', 'CANCELLED')),

    CONSTRAINT fk_advance_employee
        FOREIGN KEY (employee_id)
        REFERENCES employee(employee_id),

    INDEX idx_advance_employee_date (employee_id, advance_date)
);

-- 7. Bonus
CREATE TABLE bonus (
    bonus_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    bonus_type VARCHAR(20) NOT NULL,
    value DECIMAL(12,2) NOT NULL,
    bonus_date DATE NOT NULL,
    reason VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_bonus_type
        CHECK (bonus_type IN ('PERCENTAGE', 'FIXED')),

    CONSTRAINT chk_bonus_value
        CHECK (value >= 0),

    CONSTRAINT fk_bonus_employee
        FOREIGN KEY (employee_id)
        REFERENCES employee(employee_id),

    INDEX idx_bonus_employee_date (employee_id, bonus_date)
);

-- 8. Overtime
CREATE TABLE overtime (
    overtime_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    overtime_date DATE NOT NULL,
    hours DECIMAL(6,2) NOT NULL,
    rate_per_hour DECIMAL(12,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    notes VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_overtime_hours
        CHECK (hours > 0),

    CONSTRAINT chk_overtime_rate
        CHECK (rate_per_hour >= 0),

    CONSTRAINT chk_overtime_amount
        CHECK (amount >= 0),

    CONSTRAINT fk_overtime_employee
        FOREIGN KEY (employee_id)
        REFERENCES employee(employee_id),

    INDEX idx_overtime_employee_date (employee_id, overtime_date)
);

-- 9. Payroll
CREATE TABLE payroll (
    payroll_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    payroll_month DATE NOT NULL,
    base_salary DECIMAL(12,2) NOT NULL,
    days_in_month INT NOT NULL,
    days_worked DECIMAL(6,2) NOT NULL,
    earned_salary DECIMAL(12,2) NOT NULL,
    bonus_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    overtime_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    advance_deduction DECIMAL(12,2) NOT NULL DEFAULT 0,
    other_deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
    net_salary DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_payroll_employee_month
        UNIQUE (employee_id, payroll_month),

    CONSTRAINT chk_payroll_month
        CHECK (DAY(payroll_month) = 1),

    CONSTRAINT chk_payroll_days
        CHECK (days_in_month BETWEEN 28 AND 31),

    CONSTRAINT chk_payroll_nonnegative
        CHECK (
            base_salary >= 0 AND
            days_worked >= 0 AND
            earned_salary >= 0 AND
            bonus_amount >= 0 AND
            overtime_amount >= 0 AND
            advance_deduction >= 0 AND
            other_deductions >= 0
        ),

    CONSTRAINT chk_payroll_status
        CHECK (status IN ('DRAFT', 'FINALIZED', 'PAID')),

    CONSTRAINT fk_payroll_employee
        FOREIGN KEY (employee_id)
        REFERENCES employee(employee_id),

    INDEX idx_payroll_month (payroll_month)
);
