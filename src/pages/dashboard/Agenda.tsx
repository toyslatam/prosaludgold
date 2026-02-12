import { useState } from "react";
import { mockAppointments, mockDoctors, statusColors, statusLabels } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const Agenda = () => {
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = mockAppointments.filter((a) => {
    if (filterDoctor !== "all" && a.doctorName !== filterDoctor) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (search && !a.patientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const timeSlots = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-muted-foreground text-sm">Miércoles, 12 de febrero de 2026</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Nueva cita</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nueva cita</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Cita creada exitosamente (demo)"); }}>
              <Input placeholder="Nombre del paciente" />
              <Select><SelectTrigger><SelectValue placeholder="Doctor" /></SelectTrigger><SelectContent>{mockDoctors.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select>
              <Input type="date" defaultValue="2026-02-12" />
              <Select><SelectTrigger><SelectValue placeholder="Hora" /></SelectTrigger><SelectContent>{timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
              <Input placeholder="Motivo de la cita" />
              <Button type="submit" className="w-full">Crear cita</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar paciente..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterDoctor} onValueChange={setFilterDoctor}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Doctor" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los doctores</SelectItem>
            {mockDoctors.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="confirmada">Confirmada</SelectItem>
            <SelectItem value="en_sala">En sala</SelectItem>
            <SelectItem value="atendida">Atendida</SelectItem>
            <SelectItem value="no_asistio">No asistió</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Calendar grid mock */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="grid grid-cols-[80px_1fr] divide-x divide-border">
          <div className="bg-muted/50">
            {timeSlots.map((t) => (
              <div key={t} className="h-14 flex items-center justify-center text-xs text-muted-foreground border-b border-border">
                {t}
              </div>
            ))}
          </div>
          <div className="relative">
            {timeSlots.map((t) => (
              <div key={t} className="h-14 border-b border-border" />
            ))}
            {/* Appointments overlaid */}
            {filtered.map((apt) => {
              const slotIndex = timeSlots.indexOf(apt.time);
              if (slotIndex === -1) return null;
              const top = slotIndex * 56;
              const height = (apt.duration / 30) * 56;
              return (
                <div
                  key={apt.id}
                  className={`absolute left-2 right-2 rounded-lg p-2 border text-xs ${statusColors[apt.status]}`}
                  style={{ top: `${top}px`, height: `${Math.max(height - 4, 28)}px` }}
                >
                  <p className="font-semibold truncate">{apt.patientName}</p>
                  <p className="truncate opacity-80">{apt.doctorName} · {apt.reason}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* List view */}
      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Listado de citas ({filtered.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium">Hora</th>
                <th className="text-left p-3 font-medium">Paciente</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Doctor</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Motivo</th>
                <th className="text-left p-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((apt) => (
                <tr key={apt.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-medium">{apt.time}</td>
                  <td className="p-3">{apt.patientName}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{apt.doctorName}</td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground">{apt.reason}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[apt.status]}`}>
                      {statusLabels[apt.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Agenda;
