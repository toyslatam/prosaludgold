"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSites, type Site } from "@/lib/agenda/sites";
import { useDemo } from "@/contexts/DemoContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings } from "lucide-react";
import { toast } from "sonner";

export interface SiteManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se conserva por compatibilidad con LocationManagerModal; ya no dispara re-fetch propio de sedes. */
  onSitesChange?: () => void;
  locationCountBySiteId?: (siteId: string) => number;
}

/**
 * Las sedes ahora se gestionan en un único lugar: Configuración. Este
 * modal quedó como vista de solo lectura + acceso directo, para no tener
 * dos pantallas distintas editando el mismo dato.
 */
export function SiteManagerModal({ open, onOpenChange }: SiteManagerModalProps) {
  const { basePath } = useDemo();
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    getSites()
      .then((data) => {
        if (!cancelled) setSites(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("No se pudieron cargar las sedes.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const goToConfiguracion = () => {
    onOpenChange(false);
    navigate(`${basePath}/configuracion`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] flex flex-col w-[calc(100vw-2rem)] max-w-[480px] p-0 gap-0 rounded-none sm:rounded-lg"
        aria-modal="true"
        role="dialog"
        aria-labelledby="site-manager-title"
      >
        <DialogHeader className="p-6 pb-4">
          <DialogTitle id="site-manager-title">Sedes</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Las sedes se administran desde Configuración, para que sean las mismas en toda la app.
          </p>
        </DialogHeader>

        <div className="px-6 pb-4">
          <Button onClick={goToConfiguracion} className="w-full gap-2">
            <Settings className="w-4 h-4" />
            Ir a Configuración → Sedes
          </Button>
        </div>

        <div className="px-6 pb-2 text-sm text-muted-foreground">
          {loading ? "Cargando…" : `Sedes activas (${sites.length})`}
        </div>
        <ScrollArea className="flex-1 min-h-0 px-6 pb-4" style={{ height: "min(240px, 40vh)" }}>
          <ul className="space-y-1 pr-2" role="list" aria-label="Lista de sedes">
            {!loading && sites.length === 0 ? (
              <li className="py-6 text-center text-muted-foreground text-sm">
                No hay sedes registradas todavía.
              </li>
            ) : (
              sites.map((site) => (
                <li
                  key={site.id}
                  className="rounded-md border bg-background px-3 py-2 font-medium text-sm"
                >
                  {site.name}
                </li>
              ))
            )}
          </ul>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
