import { useState } from "react";
import * as XLSX from "xlsx";
import { useInsertDoctor } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Upload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import type { VerticalKey } from "@/config/demos";

// Formato esperado: "Listado de Colaboradores" — fila 1 título, fila 2
// encabezados, datos desde la fila 3. Columnas (en este orden):
// Nombre Colaborador | foto | CIP / Pasaporte | Domicilio | Telefono | mail |
// Terapias Que realizan | Banco | # cuenta | Tipo (ahorro / credito) | nombre del titular
interface ParsedRow {
  name: string;
  photoUrl: string;
  cedula: string;
  address: string;
  phone: string;
  email: string;
  specialty: string;
  bankName: string;
  bankAccount: string;
  accountType: "ahorro" | "corriente";
  accountHolderName: string;
  selected: boolean;
}

function parseAccountType(raw: string): "ahorro" | "corriente" {
  const v = raw.trim().toLowerCase();
  if (v.startsWith("corr") || v.startsWith("cred")) return "corriente";
  return "ahorro";
}

function cellToText(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

interface ImportColaboradoresDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vertical: VerticalKey;
  enabledModules: VerticalKey[];
  defaultBranch: string;
  onImported: () => void;
}

export function ImportColaboradoresDialog({
  open,
  onOpenChange,
  vertical,
  enabledModules,
  defaultBranch,
  onImported,
}: ImportColaboradoresDialogProps) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const insert = useInsertDoctor();

  const reset = () => {
    setRows([]);
    setFileName("");
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });

      // Encabezados en la fila que contenga "Nombre Colaborador" (tolera la
      // fila de título "Colaboradores ..." arriba).
      const headerIdx = matrix.findIndex((r) =>
        r.some((c) => cellToText(c).toLowerCase().includes("nombre colaborador"))
      );
      if (headerIdx === -1) {
        toast.error('No se encontró la columna "Nombre Colaborador". Revisa el formato del archivo.');
        return;
      }

      const parsed: ParsedRow[] = [];
      for (let i = headerIdx + 1; i < matrix.length; i++) {
        const r = matrix[i];
        const name = cellToText(r[0]);
        if (!name) continue;
        parsed.push({
          name,
          photoUrl: cellToText(r[1]),
          cedula: cellToText(r[2]),
          address: cellToText(r[3]),
          phone: cellToText(r[4]),
          email: cellToText(r[5]),
          specialty: cellToText(r[6]),
          bankName: cellToText(r[7]),
          bankAccount: cellToText(r[8]),
          accountType: parseAccountType(cellToText(r[9])),
          accountHolderName: cellToText(r[10]) || name,
          selected: true,
        });
      }

      if (parsed.length === 0) {
        toast.error("No se encontraron filas con nombre para importar.");
        return;
      }
      setRows(parsed);
    } catch {
      toast.error("No se pudo leer el archivo. ¿Es un .xlsx válido?");
    }
  };

  const toggleRow = (i: number) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, selected: !r.selected } : r)));

  const handleImport = async () => {
    const toImport = rows.filter((r) => r.selected);
    if (toImport.length === 0) return toast.error("Selecciona al menos un colaborador");

    setImporting(true);
    let ok = 0;
    let failed = 0;
    for (const r of toImport) {
      try {
        await insert.mutateAsync({
          name: r.name,
          specialty: r.specialty || "General",
          branch: defaultBranch,
          available: true,
          modules_enabled: vertical === "multi" ? enabledModules : [vertical],
          commission_percentage: 60,
          cedula: r.cedula || null,
          address: r.address || null,
          photo_url: r.photoUrl || null,
          email: r.email || null,
          phone: r.phone || null,
          bank_name: r.bankName || null,
          bank_account: r.bankAccount || null,
          account_type: r.accountType,
          account_holder_name: r.accountHolderName,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        ok++;
      } catch {
        failed++;
      }
    }
    setImporting(false);

    if (failed === 0) toast.success(`${ok} colaborador(es) importados`);
    else toast.error(`${ok} importados, ${failed} fallaron`);

    onImported();
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Importar colaboradores desde Excel</DialogTitle></DialogHeader>

        {rows.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sube el archivo "Listado de Colaboradores" (mismo formato: Nombre, foto, CIP/Pasaporte,
              Domicilio, Teléfono, mail, Terapias que realizan, Banco, # cuenta, Tipo de cuenta, nombre del titular).
            </p>
            <div className="space-y-1.5">
              <Label>Archivo (.xlsx)</Label>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <FileSpreadsheet className="w-4 h-4" /> {fileName} · {rows.length} fila(s) encontradas
              </span>
              <Button variant="ghost" size="sm" onClick={reset}>Cambiar archivo</Button>
            </div>
            <div className="border border-border rounded-lg overflow-x-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Nombre</TableHead>
                    <TableHead>Terapias</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead># cuenta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Titular</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i} className={!r.selected ? "opacity-40" : undefined}>
                      <TableCell>
                        <input type="checkbox" checked={r.selected} onChange={() => toggleRow(i)} />
                      </TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.specialty || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.phone || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.bankName || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.bankAccount || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground capitalize">{r.accountType}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.accountHolderName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }} disabled={importing}>
                Cancelar
              </Button>
              <Button onClick={handleImport} disabled={importing} className="gap-2">
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {importing ? "Importando…" : `Importar ${rows.filter((r) => r.selected).length}`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
