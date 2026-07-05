import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTanks, getLivestockForTank, createLivestock, deleteTank, getTelemetryForTank, getAlertsForTank, acknowledgeAlert } from '../lib/api';
import type { Tank, Livestock, LivestockStatus, ParameterThreshold, Alert } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { TelemetryCharts } from '../components/telemetry/TelemetryCharts';
import { ParameterLogger } from '../components/telemetry/ParameterLogger';
import { MaintenanceScheduler } from '../components/maintenance/MaintenanceScheduler';
import { searchSpecies } from '../lib/api';
import type { Species } from '../lib/api';
import { AlertTriangle } from 'lucide-react';

export default function TankDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [tank, setTank] = useState<Tank | null>(null);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);

  // Telemetry state
  const [logs, setLogs] = useState<any[]>([]);
  const [thresholds, setThresholds] = useState<ParameterThreshold[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loggerOpen, setLoggerOpen] = useState(false);

  // Livestock form state
  const [lsOpen, setLsOpen] = useState(false);
  const [lsCommonName, setLsCommonName] = useState('');
  const [lsQuantity, setLsQuantity] = useState<number | ''>('');
  const [lsDateAdded, setLsDateAdded] = useState(new Date().toISOString().split('T')[0]);
  const [lsStatus, setLsStatus] = useState<LivestockStatus>('alive');
  const [lsSubmitting, setLsSubmitting] = useState(false);
  
  // Species Autocomplete State
  const [lsSpeciesResults, setLsSpeciesResults] = useState<Species[]>([]);
  const [lsSelectedSpecies, setLsSelectedSpecies] = useState<Species | null>(null);

  useEffect(() => {
    if (lsCommonName.length >= 2 && (!lsSelectedSpecies || lsCommonName !== lsSelectedSpecies.common_name)) {
      const timeout = setTimeout(() => {
        searchSpecies(lsCommonName).then(setLsSpeciesResults).catch(console.error);
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setLsSpeciesResults([]);
    }
  }, [lsCommonName, lsSelectedSpecies]);

  const handleSpeciesSelect = (s: Species) => {
    setLsSelectedSpecies(s);
    setLsCommonName(s.common_name);
    setLsSpeciesResults([]);
  };

  useEffect(() => {
    async function loadData() {
      if (!user || !id) return;
      try {
        const tanks = await getTanks(user.id);
        const t = tanks.find(t => t.id === id);
        if (!t) {
          toast.error("Tank not found");
          navigate('/dashboard');
          return;
        }
        setTank(t);
        const ls = await getLivestockForTank(id);
        setLivestock(ls);

        const { logs: l, thresholds: th } = await getTelemetryForTank(id);
        setLogs(l);
        setThresholds(th);

        const al = await getAlertsForTank(id);
        setAlerts(al);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user, navigate]);

  const refreshTelemetry = async () => {
    if (!id) return;
    const { logs: l, thresholds: th } = await getTelemetryForTank(id);
    setLogs(l);
    setThresholds(th);
    const al = await getAlertsForTank(id);
    setAlerts(al);
  };

  const handleAckAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, status: 'acknowledged', acknowledged_at: new Date().toISOString() } : a));
      toast.success('Alert acknowledged');
    } catch (err: any) {
      toast.error('Failed to acknowledge alert: ' + err.message);
    }
  };

  const handleAddLivestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    if (lsCommonName.length < 1) {
      toast.error('Common name is required');
      return;
    }
    if (typeof lsQuantity !== 'number' || lsQuantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    setLsSubmitting(true);
    try {
      const newLs = await createLivestock({
        tank_id: id,
        common_name: lsCommonName,
        quantity: lsQuantity,
        date_added: lsDateAdded,
        status: lsStatus,
      });
      setLivestock([newLs, ...livestock]);
      setLsOpen(false);
      toast.success('Livestock added successfully');
      
      // Reset form
      setLsCommonName('');
      setLsSelectedSpecies(null);
      setLsSpeciesResults([]);
      setLsQuantity('');
      setLsDateAdded(new Date().toISOString().split('T')[0]);
      setLsStatus('alive');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLsSubmitting(false);
    }
  };

  const handleDeleteTank = async () => {
    if (!id || !confirm("Are you sure you want to delete this tank? This will soft-delete the record.")) return;
    try {
      await deleteTank(id);
      toast.success("Tank deleted successfully");
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-muted-foreground">Loading tank details...</div>;
  }

  if (!tank) return null;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Button variant="link" onClick={() => navigate('/dashboard')} className="pl-0 text-muted-foreground hover:text-primary">&larr; Back to Dashboard</Button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-2">{tank.name}</h1>
          <p className="text-muted-foreground capitalize mt-1">{tank.tank_type} • {tank.volume} {tank.volume_unit}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setLoggerOpen(true)}>
            Log Parameters
          </Button>
          <Button variant="destructive" onClick={handleDeleteTank}>Delete Tank</Button>
        </div>
      </div>

      <ParameterLogger 
        tankId={tank.id} 
        tankType={tank.tank_type} 
        open={loggerOpen} 
        onOpenChange={setLoggerOpen} 
        onLogged={refreshTelemetry} 
      />

      {/* Alerts Panel */}
      {alerts.some(a => a.status === 'active') && (
        <div className="mb-6 space-y-3">
          {alerts.filter(a => a.status === 'active').map(alert => (
            <div key={alert.id} className="flex items-center justify-between p-4 bg-destructive/10 border border-destructive/30 rounded-lg shadow-[0_0_15px_rgba(127,29,29,0.2)]">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive animate-pulse" />
                <div>
                  <h4 className="font-semibold text-destructive uppercase tracking-wide">Parameter Alert: {alert.parameter_type}</h4>
                  <p className="text-sm text-foreground/80">
                    Logged value <span className="font-bold text-foreground">{alert.logged_value}</span> is outside safe bounds ({alert.threshold_min} - {alert.threshold_max}).
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleAckAlert(alert.id)}>
                Acknowledge
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Telemetry Section */}
          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Water Chemistry Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <TelemetryCharts logs={logs} thresholds={thresholds} />
            </CardContent>
          </Card>

          {/* Livestock Section */}
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Livestock</CardTitle>
              <Dialog open={lsOpen} onOpenChange={setLsOpen}>
                <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => setLsOpen(true)}>+ Add Livestock</Button>
                <DialogContent className="bg-card text-card-foreground border-border sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Livestock</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddLivestock} className="space-y-4 pt-4">
                    <div className="space-y-2 relative">
                      <Label htmlFor="common_name">Common Name</Label>
                      <Input 
                        id="common_name" 
                        required 
                        autoComplete="off"
                        value={lsCommonName} 
                        onChange={e => {
                          setLsCommonName(e.target.value);
                          if (lsSelectedSpecies && e.target.value !== lsSelectedSpecies.common_name) {
                            setLsSelectedSpecies(null);
                          }
                        }} 
                        className="bg-input" 
                        placeholder="e.g. Neon Tetra" 
                      />
                      {lsSpeciesResults.length > 0 && (
                        <div className="absolute z-10 w-full bg-card border border-border mt-1 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {lsSpeciesResults.map(s => (
                            <div 
                              key={s.id} 
                              className="px-3 py-2 cursor-pointer hover:bg-muted/50 text-sm"
                              onClick={() => handleSpeciesSelect(s)}
                            >
                              <div className="font-medium">{s.common_name}</div>
                              <div className="text-xs text-muted-foreground">{s.scientific_name} • {s.tank_environment}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {lsSelectedSpecies?.mismatch_risk && (lsSelectedSpecies.mismatch_risk === 'Critical' || lsSelectedSpecies.mismatch_risk === 'High') && (
                      <div className="p-3 bg-zinc-900 border border-destructive/80 rounded-md shadow-[0_0_10px_rgba(239,68,68,0.2)] flex gap-3 items-start animate-in slide-in-from-top-2">
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <div className="font-bold text-destructive text-sm tracking-wide uppercase">Biological Risk: {lsSelectedSpecies.mismatch_risk}</div>
                          <div className="text-sm text-foreground/90 mt-1">{lsSelectedSpecies.mismatch_notes}</div>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" type="number" required min="1" value={lsQuantity} onChange={e => setLsQuantity(e.target.value === '' ? '' : Number(e.target.value))} className="bg-input" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={lsStatus} onValueChange={(v) => setLsStatus(v as LivestockStatus)}>
                          <SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alive">Alive</SelectItem>
                            <SelectItem value="deceased">Deceased</SelectItem>
                            <SelectItem value="rehomed">Rehomed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_added">Date Added</Label>
                      <Input 
                        id="date_added" 
                        type="date" 
                        required 
                        value={lsDateAdded}
                        max={new Date().toISOString().split('T')[0]} // Cannot be in the future
                        min={(() => {
                          const d = new Date();
                          d.setFullYear(d.getFullYear() - 1);
                          return d.toISOString().split('T')[0];
                        })()} // Max 1 year back
                        onChange={e => setLsDateAdded(e.target.value)} 
                        className="bg-input"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setLsOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={lsSubmitting}>Save</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {livestock.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-md">
                  No livestock logged in this tank yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>Species</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Date Added</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {livestock.map(ls => (
                      <TableRow key={ls.id} className="border-border hover:bg-muted/50">
                        <TableCell className="font-medium">{ls.common_name}</TableCell>
                        <TableCell>{ls.quantity}</TableCell>
                        <TableCell>{new Date(ls.date_added).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            ls.status === 'alive' ? 'border-primary/50 text-primary' : 
                            ls.status === 'deceased' ? 'border-destructive text-destructive' : 'text-muted-foreground'
                          }>
                            {ls.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          {/* Maintenance Section */}
          <MaintenanceScheduler tankId={tank.id} />
        </div>

        {/* Tank Info / Settings */}
        <div className="space-y-6">
          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tank.temp_target && (
                <div>
                  <div className="text-sm text-muted-foreground">Target Temperature</div>
                  <div className="font-medium">{tank.temp_target}°</div>
                </div>
              )}
              {tank.notes && (
                <div>
                  <div className="text-sm text-muted-foreground">Notes</div>
                  <div className="text-sm whitespace-pre-wrap">{tank.notes}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="text-sm">{new Date(tank.created_at).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
