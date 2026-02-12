import { useState } from "react";
import { mockPatients, statusColors, statusLabels } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Eye, Phone, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Pacientes = () => {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<typeof mockPatients[0] | null>(null);

  const filtered = mockPatients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.cedula.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground text-sm">{mockPatients.length} pacientes registrados</p>
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
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setSelectedPatient(patient)}>
                  <Eye className="w-3 h-3" /> Ver ficha
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Patient detail dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedPatient && (
            <>
              <DialogHeader>
                <DialogTitle>Ficha de {selectedPatient.name}</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="info" className="mt-4">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="info">Datos</TabsTrigger>
                  <TabsTrigger value="treatments">Tratamientos</TabsTrigger>
                  <TabsTrigger value="docs">Documentos</TabsTrigger>
                  <TabsTrigger value="odontogram">Odontograma</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Cédula:</span> <span className="font-medium">{selectedPatient.cedula}</span></div>
                    <div><span className="text-muted-foreground">Teléfono:</span> <span className="font-medium">{selectedPatient.phone}</span></div>
                    <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{selectedPatient.email}</span></div>
                    <div><span className="text-muted-foreground">Nacimiento:</span> <span className="font-medium">{selectedPatient.birthDate}</span></div>
                    <div><span className="text-muted-foreground">Última visita:</span> <span className="font-medium">{selectedPatient.lastVisit}</span></div>
                    <div><span className="text-muted-foreground">Próxima cita:</span> <span className="font-medium">{selectedPatient.nextAppointment}</span></div>
                  </div>
                </TabsContent>
                <TabsContent value="treatments" className="mt-4">
                  <div className="space-y-3">
                    {selectedPatient.treatments.map((t) => (
                      <div key={t.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{t.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[t.status]}`}>{statusLabels[t.status]}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Costo: ${t.cost}</span>
                          <span>Pagado: ${t.paid}</span>
                          <span>Saldo: ${t.cost - t.paid}</span>
                        </div>
                        <div className="mt-2 w-full bg-muted rounded-full h-2">
                          <div className="bg-primary rounded-full h-2" style={{ width: `${(t.paid / t.cost) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="docs" className="mt-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No hay documentos cargados para este paciente.</p>
                    <Button variant="outline" size="sm" className="mt-3">Subir documento</Button>
                  </div>
                </TabsContent>
                <TabsContent value="odontogram" className="mt-4">
                  {/* Simple odontogram mock */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">Odontograma (vista simplificada)</p>
                    <div className="grid grid-cols-16 gap-1 max-w-md mx-auto">
                      {/* Upper teeth */}
                      <div className="col-span-16 flex justify-center gap-1 mb-2">
                        {[18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28].map((tooth) => (
                          <div key={tooth} className="w-6 h-8 rounded border border-border bg-muted/50 flex items-center justify-center text-[10px] text-muted-foreground hover:bg-primary/10 hover:border-primary cursor-pointer transition-colors">
                            {tooth}
                          </div>
                        ))}
                      </div>
                      {/* Lower teeth */}
                      <div className="col-span-16 flex justify-center gap-1">
                        {[48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38].map((tooth) => (
                          <div key={tooth} className="w-6 h-8 rounded border border-border bg-muted/50 flex items-center justify-center text-[10px] text-muted-foreground hover:bg-primary/10 hover:border-primary cursor-pointer transition-colors">
                            {tooth}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pacientes;
