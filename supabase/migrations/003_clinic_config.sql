-- Configuración general de la clínica/organización
CREATE TABLE IF NOT EXISTS clinic_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Datos de la organización
  name text NOT NULL DEFAULT '',
  ruc text,
  address text,
  phone text,
  email text,
  website text,
  country text DEFAULT 'PA',
  currency text DEFAULT 'USD',
  timezone text DEFAULT 'America/Panama',
  language text DEFAULT 'es',

  -- Módulos habilitados: 'dental', 'medical', 'spa'
  modules_enabled text[] DEFAULT '{}',

  -- Preferencias de notificaciones
  notify_whatsapp boolean DEFAULT false,
  notify_email boolean DEFAULT true,
  notify_inventory_alert boolean DEFAULT true,
  notify_payment boolean DEFAULT true,

  -- Estado del onboarding
  onboarding_complete boolean DEFAULT false
);

-- Sedes (locations) de la clínica
CREATE TABLE IF NOT EXISTS sedes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  clinic_config_id uuid REFERENCES clinic_config(id) ON DELETE CASCADE,

  name text NOT NULL,
  address text,
  phone text,
  email text,
  active boolean DEFAULT true,

  -- Módulos habilitados en esta sede (subset de clinic_config.modules_enabled)
  modules_enabled text[] DEFAULT '{}',

  -- Horarios: { lunes: { open: "08:00", close: "18:00" }, ... }
  schedule jsonb DEFAULT '{}'
);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clinic_config_updated_at
  BEFORE UPDATE ON clinic_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sedes_updated_at
  BEFORE UPDATE ON sedes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE clinic_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own clinic_config"
  ON clinic_config
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own sedes"
  ON sedes
  FOR ALL
  USING (
    clinic_config_id IN (
      SELECT id FROM clinic_config WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    clinic_config_id IN (
      SELECT id FROM clinic_config WHERE user_id = auth.uid()
    )
  );
