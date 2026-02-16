import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import { getPatients } from "@/lib/patients/repository";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Eye, Phone, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const Pacientes = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { basePath } = useDemo();
  const patients = getPatients();
  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.cedula.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground text-sm">{patients.length} pacientes registrados</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Nuevo paciente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar paciente</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Paciente registrado (demo)"); }}>
              <Input placeholder="Nombre completo" />
              <Input placeholder="Cédula" />
              <Input placeholder="Teléfono" type="tel" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Fecha de nacimiento" type="date" />
              <Button type="submit" className="w-full">Registrar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre o cédula..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Patient list */}
      <div className="grid gap-4">
        {filtered.map((patient) => (
          <div key={patient.id} className="bg-card rounded-xl border border-border shadow-card p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-primary">{patient.name.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{patient.name}</h3>
                  <p className="text-sm text-muted-foreground">Cédula: {patient.cedula}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{patient.phone}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{patient.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {patient.balance > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full border bg-warning/10 text-warning border-warning/20">
                    Saldo: ${patient.balance}
                  </span>
                )}
                <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => navigate(`${basePath}/pacientes/${patient.id}/datos`)}
              >
                <Eye className="w-3 h-3" /> Ver ficha
              </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Pacientes;
