-- ============================================================
-- ProSalud Gold — Tablas financieras y experiencia (Migración 002)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- IMPORTANTE: Ejecutar DESPUÉS de 001_initial_schema.sql
-- ============================================================

-- Columna de categoría en caja/gastos
ALTER TABLE cash_entries ADD COLUMN IF NOT EXISTS category TEXT;

-- ── Tabla: payroll_entries (Remuneraciones) ───────────────────
CREATE TABLE IF NOT EXISTS payroll_entries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id     UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  period        TEXT NOT NULL,                       -- formato: YYYY-MM
  percentage    NUMERIC(5,2) NOT NULL DEFAULT 40,
  sessions      INTEGER NOT NULL DEFAULT 0,
  gross_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,    -- gross * percentage / 100
  status        TEXT NOT NULL DEFAULT 'pendiente'
                  CHECK (status IN ('pendiente', 'liquidado')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (doctor_id, period)
);

-- ── Tabla: patient_feedback (Experiencia del paciente) ────────
CREATE TABLE IF NOT EXISTS patient_feedback (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id    UUID REFERENCES patients(id) ON DELETE SET NULL,
  patient_name  TEXT,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  nps_score     INTEGER CHECK (nps_score BETWEEN 0 AND 10),
  comment       TEXT,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Triggers ──────────────────────────────────────────────────
CREATE TRIGGER trg_payroll_entries_updated_at
  BEFORE UPDATE ON payroll_entries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Índices ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_payroll_doctor   ON payroll_entries(doctor_id);
CREATE INDEX IF NOT EXISTS idx_payroll_period   ON payroll_entries(period);
CREATE INDEX IF NOT EXISTS idx_feedback_date    ON patient_feedback(date);
CREATE INDEX IF NOT EXISTS idx_cash_category    ON cash_entries(category);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE payroll_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access" ON payroll_entries
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON patient_feedback
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
