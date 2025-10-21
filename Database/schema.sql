-- ============================================
-- SISTEMA DE GESTIÓN DE PROPIEDADES EN ALQUILER
-- Base de Datos PostgreSQL
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: users (Usuarios del sistema)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'PROPIETARIO', 'INQUILINO', 'TECNICO')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: properties (Propiedades)
-- ============================================
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    property_type VARCHAR(50) NOT NULL, -- casa, departamento, local, etc.
    size_m2 DECIMAL(10,2),
    bedrooms INTEGER,
    bathrooms INTEGER,
    description TEXT,
    status VARCHAR(20) DEFAULT 'DISPONIBLE' CHECK (status IN ('DISPONIBLE', 'ALQUILADO', 'MANTENIMIENTO')),
    electricity_meter VARCHAR(50), -- Número de medidor de luz
    water_meter VARCHAR(50), -- Número de medidor de agua
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: contracts (Contratos de alquiler)
-- ============================================
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2) NOT NULL,
    commission DECIMAL(10,2) DEFAULT 0,
    special_clauses TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVO' CHECK (status IN ('ACTIVO', 'FINALIZADO', 'CANCELADO')),
    contract_document_url TEXT, -- URL del contrato PDF/imagen
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: installments (Cuotas generadas automáticamente)
-- ============================================
CREATE TABLE installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'PAGADO', 'VENCIDO')),
    paid_date TIMESTAMP,
    late_fee DECIMAL(10,2) DEFAULT 0, -- Multa por morosidad
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contract_id, installment_number)
);

-- ============================================
-- TABLA: expenses (Expensas - luz, agua, etc.)
-- ============================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    expense_type VARCHAR(50) NOT NULL CHECK (expense_type IN ('LUZ', 'AGUA', 'OTROS')),
    amount DECIMAL(10,2) NOT NULL,
    billing_period DATE NOT NULL, -- Mes de la expensa
    description TEXT,
    receipt_url TEXT, -- Comprobante de la expensa
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: payments (Pagos realizados)
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    installment_id UUID NOT NULL REFERENCES installments(id) ON DELETE RESTRICT,
    payment_number VARCHAR(50) UNIQUE NOT NULL, -- Número de recibo
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('EFECTIVO', 'TRANSFERENCIA', 'QR')),
    reference_number VARCHAR(100), -- Número de referencia de transferencia
    proof_url TEXT, -- Comprobante de pago adjunto
    notes TEXT,
    receipt_pdf_url TEXT, -- URL del recibo PDF generado
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: maintenance_tickets (Tickets de mantenimiento)
-- ============================================
CREATE TABLE maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- basura, desperfecto, limpieza, etc.
    priority VARCHAR(20) DEFAULT 'MEDIA' CHECK (priority IN ('BAJA', 'MEDIA', 'ALTA', 'URGENTE')),
    status VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'CANCELADO')),
    cost DECIMAL(10,2) DEFAULT 0, -- Costo del mantenimiento
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: ticket_attachments (Fotos de tickets)
-- ============================================
CREATE TABLE ticket_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES maintenance_tickets(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(10) NOT NULL, -- foto_inicial, foto_trabajo, documento
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: audit_logs (Auditoría de cambios)
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    changes JSONB, -- Cambios realizados en formato JSON
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: documents (Documentos adjuntos a contratos)
-- ============================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- contrato, garantia, identificacion
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES para mejorar rendimiento
-- ============================================
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_contracts_property ON contracts(property_id);
CREATE INDEX idx_contracts_tenant ON contracts(tenant_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_installments_contract ON installments(contract_id);
CREATE INDEX idx_installments_status ON installments(status);
CREATE INDEX idx_installments_due_date ON installments(due_date);
CREATE INDEX idx_payments_installment ON payments(installment_id);
CREATE INDEX idx_tickets_property ON maintenance_tickets(property_id);
CREATE INDEX idx_tickets_tenant ON maintenance_tickets(tenant_id);
CREATE INDEX idx_tickets_assigned ON maintenance_tickets(assigned_to);
CREATE INDEX idx_tickets_status ON maintenance_tickets(status);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_table ON audit_logs(table_name);

-- ============================================
-- FUNCIÓN: Actualizar timestamp automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TRIGGERS para actualizar updated_at
-- ============================================
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installments_updated_at BEFORE UPDATE ON installments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON maintenance_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DATOS INICIALES: Usuario Administrador
-- ============================================
-- Contraseña: Admin123! (debe hashearse en la aplicación)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES 
('admin', 'admin@sistema.com', '$2b$10$placeholder', 'Administrador del Sistema', 'ADMIN');

-- ============================================
-- COMENTARIOS EN LAS TABLAS
-- ============================================
COMMENT ON TABLE users IS 'Usuarios del sistema con roles diferenciados';
COMMENT ON TABLE properties IS 'Propiedades individuales en alquiler';
COMMENT ON TABLE contracts IS 'Contratos de alquiler entre propietario e inquilino';
COMMENT ON TABLE installments IS 'Cuotas mensuales generadas automáticamente por contrato';
COMMENT ON TABLE expenses IS 'Expensas variables (luz, agua) asociadas a contratos';
COMMENT ON TABLE payments IS 'Pagos realizados contra cuotas';
COMMENT ON TABLE maintenance_tickets IS 'Tickets de mantenimiento reportados por inquilinos';
COMMENT ON TABLE audit_logs IS 'Registro de auditoría de todas las operaciones críticas';