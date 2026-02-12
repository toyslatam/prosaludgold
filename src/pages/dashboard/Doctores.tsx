import { mockDoctors } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

const Doctores = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold">Doctores y Usuarios</h1>
      <p className="text-muted-foreground text-sm">Gestión de profesionales, roles y permisos</p>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockDoctors.map((doc) => (
        <div key={doc.id} className="bg-card rounded-xl p-5 border border-border shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-bold text-primary text-sm">{doc.name.split(" ").slice(-1)[0][0]}{doc.name.split(" ").slice(-2)[0]?.[0] || ""}</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">{doc.name}</h3>
              <p className="text-xs text-muted-foreground">{doc.specialty}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{doc.branch}</span>
            <Badge variant={doc.available ? "default" : "secondary"} className="text-xs">
              {doc.available ? "Disponible" : "No disponible"}
            </Badge>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-card rounded-xl border border-border shadow-card p-5">
      <h2 className="font-semibold mb-4">Roles del sistema</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {["Administrador", "Recepción", "Doctor", "Caja", "Inventario"].map((role) => (
          <div key={role} className="p-3 border border-border rounded-lg text-center">
            <p className="font-medium text-sm">{role}</p>
            <p className="text-xs text-muted-foreground mt-1">Permisos configurables</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Doctores;
