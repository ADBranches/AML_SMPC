import { useEffect, useState } from "react";
import { systemApi, type ServiceStatus } from "../../api/systemApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { JsonViewer } from "../../components/ui/JsonViewer";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function AdminDashboardPage() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [smpcStatus, setSmpcStatus] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [serviceStatuses, smpc] = await Promise.all([
        systemApi.checkAllServices(),
        systemApi.smpcStatus().catch((err) => ({
          error: err instanceof Error ? err.message : "SMPC status unavailable",
        })),
      ]);

      setServices(serviceStatuses);
      setSmpcStatus(smpc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin status");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const healthy = services.filter((service) => service.status === "ok").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin/System Operations Dashboard"
        description="Live service-health and cryptographic-runtime readiness for the AML SMPC prototype."
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">Services Healthy</p>
          <h3 className="mt-2 text-3xl font-black">
            {healthy}/{services.length}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Live checks through the frontend proxy.
          </p>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">SoftHSM / Keys</p>
          <h3 className="mt-2 text-xl font-bold">Configured for MVP</h3>
          <p className="mt-2 text-sm text-slate-600">
            SoftHSM key-management visibility still needs a dedicated backend endpoint.
          </p>
          <div className="mt-4">
            <StatusBadge status="VISIBILITY_PENDING" />
          </div>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">GDPR Retention</p>
          <h3 className="mt-2 text-xl font-bold">Configured / Controlled</h3>
          <p className="mt-2 text-sm text-slate-600">
            Retention configs exist. Automated purge visibility should be exposed before production claims.
          </p>
          <div className="mt-4">
            <StatusBadge status="MVP_CONFIGURED" />
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {services.map((service) => (
          <Card key={service.name}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">{service.url}</p>
                <h3 className="mt-1 font-bold">{service.name}</h3>
              </div>
              <StatusBadge status={service.status} />
            </div>

            <div className="mt-4">
              <JsonViewer value={service.payload ?? { error: service.error }} />
            </div>
          </Card>
        ))}
      </section>

      <Card>
        <h3 className="mb-3 font-bold">SMPC Runtime Status</h3>
        <JsonViewer value={smpcStatus} />
      </Card>
    </div>
  );
}
