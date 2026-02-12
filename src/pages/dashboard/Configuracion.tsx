import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const Configuracion = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold">Configuración</h1>
      <p className="text-muted-foreground text-sm">Datos de la clínica, sedes, servicios y preferencias</p>
    </div>

    <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-6">
      <div>
        <h2 className="font-semibold mb-4">Datos de la clínica</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input defaultValue="Dental One Panamá" />
          <Input defaultValue="info@dentalonepanama.com" />
          <Input defaultValue="+507 300-0000" />
          <Input defaultValue="Ciudad de Panamá" />
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-4">Sedes</h2>
        <div className="space-y-2">
          {["Sede Central", "Sede Sur", "Sede Norte"].map(s => (
            <div key={s} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm">{s}</span>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-4">Notificaciones</h2>
        <div className="space-y-3">
          {[
            "Recordatorios por WhatsApp",
            "Recordatorios por email",
            "Alertas de inventario bajo",
            "Notificación de pagos recibidos",
          ].map(n => (
            <div key={n} className="flex items-center justify-between">
              <span className="text-sm">{n}</span>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </div>

      <Button onClick={() => toast.success("Configuración guardada (demo)")}>Guardar cambios</Button>
    </div>
  </div>
);

export default Configuracion;
